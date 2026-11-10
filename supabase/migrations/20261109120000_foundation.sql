-- AsterPath backend foundation (Phase 2).
-- Profiles, team roles and permissions, enquiries (leads) and an append-only audit log,
-- with Row Level Security on every table. Students and team members sign in through
-- Supabase Auth; enquiries are written only by the server (service role).

create extension if not exists citext with schema extensions;

-- ── Roles and permissions ────────────────────────────────────────────────────

create type public.team_role as enum (
  'owner',
  'admin',
  'advisor',
  'document_reviewer',
  'finance',
  'marketing',
  'analyst'
);

create table public.permissions (
  key text primary key check (key ~ '^[a-z]+\.[a-z]+$'),
  description text not null
);

create table public.role_permissions (
  role public.team_role not null,
  permission text not null references public.permissions (key) on delete cascade,
  primary key (role, permission)
);

-- ── People ──────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  phone text check (char_length(phone) <= 32),
  terms_version text,
  privacy_version text,
  agreements_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role public.team_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Enquiries ───────────────────────────────────────────────────────────────

create type public.lead_status as enum ('new', 'contacted', 'consultation_booked', 'qualified', 'converted', 'closed');

create table public.leads (
  id uuid primary key,
  reference text not null unique check (reference ~ '^AP-[0-9]{6}-[A-Z0-9]{5}$'),
  status public.lead_status not null default 'new',
  assigned_to uuid references public.team_members (user_id) on delete set null,
  follow_up_due_at timestamptz not null,

  full_name text not null check (char_length(full_name) between 1 and 120),
  email extensions.citext not null check (char_length(email) <= 254),
  whatsapp text not null check (char_length(whatsapp) <= 32),
  residence text not null check (char_length(residence) <= 80),

  level text not null check (char_length(level) <= 40),
  intake text not null check (char_length(intake) <= 40),
  field_of_study text not null check (char_length(field_of_study) <= 120),
  scholarship_interest text not null check (char_length(scholarship_interest) <= 20),

  highest_qualification text not null check (char_length(highest_qualification) <= 40),
  academic_background text not null check (char_length(academic_background) <= 400),
  english_test text not null check (char_length(english_test) <= 40),
  passport_status text not null check (char_length(passport_status) <= 40),
  budget_range text not null check (char_length(budget_range) <= 40),

  consultation_method text not null check (char_length(consultation_method) <= 20),
  message text not null default '' check (char_length(message) <= 2000),

  privacy_notice_version text not null,
  contact_consent boolean not null check (contact_consent),
  age_or_guardian_confirmed boolean not null check (age_or_guardian_confirmed),
  updates_consent boolean not null default false,
  consent_recorded_at timestamptz not null,

  attribution jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_follow_up_idx on public.leads (status, follow_up_due_at);
create index leads_assigned_to_idx on public.leads (assigned_to) where assigned_to is not null;
create index leads_email_idx on public.leads (email);

-- ── Audit log (append-only) ─────────────────────────────────────────────────

create table public.audit_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  action text not null check (action in ('insert', 'update', 'delete')),
  entity text not null,
  entity_id text not null,
  changed_columns text[] not null default '{}',
  -- Old and new values only for tables without personal data; for personal data
  -- the log records which columns changed, never their contents.
  details jsonb
);

create index audit_events_entity_idx on public.audit_events (entity, entity_id, occurred_at desc);
create index audit_events_actor_idx on public.audit_events (actor_id, occurred_at desc);

-- ── Helper functions ────────────────────────────────────────────────────────

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- The caller's active team role, or null for students and signed-out visitors.
create function public.current_team_role() returns public.team_role
language sql
stable
security definer
set search_path = ''
as $$
  select tm.role
  from public.team_members tm
  where tm.user_id = (select auth.uid()) and tm.active
$$;

create function public.has_permission(requested text) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_members tm
    join public.role_permissions rp on rp.role = tm.role
    where tm.user_id = (select auth.uid())
      and tm.active
      and rp.permission = requested
  )
$$;

-- A profile for every new account, carrying the agreements accepted at sign-up.
create function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, full_name, terms_version, privacy_version, agreements_accepted_at)
  values (
    new.id,
    nullif(left(trim(coalesce(meta ->> 'full_name', meta ->> 'name', '')), 120), ''),
    nullif(left(meta ->> 'terms_version', 40), ''),
    nullif(left(meta ->> 'privacy_version', 40), ''),
    case when meta ? 'terms_version' then now() end
  );
  return new;
end;
$$;

create function public.audit_row_change() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  personal boolean := tg_argv[0] = 'personal';
  old_row jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  new_row jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  changed text[];
  row_id text;
begin
  select coalesce(array_agg(key order by key), '{}')
    into changed
    from jsonb_object_keys(coalesce(new_row, old_row)) as key
   where key not in ('updated_at')
     and (old_row is null or new_row is null or old_row -> key is distinct from new_row -> key);

  if tg_op = 'UPDATE' and cardinality(changed) = 0 then
    return new;
  end if;

  row_id := coalesce(new_row, old_row) ->> coalesce(tg_argv[1], 'id');

  insert into public.audit_events (actor_id, action, entity, entity_id, changed_columns, details)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    row_id,
    changed,
    case when personal then null else jsonb_build_object('old', old_row, 'new', new_row) end
  );
  return coalesce(new, old);
end;
$$;

-- ── Triggers ────────────────────────────────────────────────────────────────

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger team_members_updated_at before update on public.team_members for each row execute function public.set_updated_at();
create trigger leads_updated_at before update on public.leads for each row execute function public.set_updated_at();

create trigger profiles_audit after insert or update or delete on public.profiles
  for each row execute function public.audit_row_change('personal', 'id');
create trigger leads_audit after insert or update or delete on public.leads
  for each row execute function public.audit_row_change('personal', 'id');
create trigger team_members_audit after insert or update or delete on public.team_members
  for each row execute function public.audit_row_change('plain', 'user_id');
create trigger role_permissions_audit after insert or update or delete on public.role_permissions
  for each row execute function public.audit_row_change('plain', 'role');

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.team_members enable row level security;
alter table public.leads enable row level security;
alter table public.audit_events enable row level security;

-- Signed-out visitors get nothing; signed-in users only what a policy allows.
revoke all on all tables in schema public from anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.audit_row_change() from public, anon, authenticated;

grant select on public.permissions, public.role_permissions to authenticated;
grant insert, delete on public.role_permissions to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
grant select, insert, update, delete on public.team_members to authenticated;
grant select, update on public.leads to authenticated;
grant delete on public.leads to authenticated;
grant select on public.audit_events to authenticated;

create policy "Team members read permissions" on public.permissions
  for select to authenticated using ((select public.current_team_role()) is not null);

create policy "Team members read role permissions" on public.role_permissions
  for select to authenticated using ((select public.current_team_role()) is not null);
create policy "Role managers grant permissions" on public.role_permissions
  for insert to authenticated with check ((select public.has_permission('roles.manage')));
create policy "Role managers revoke permissions" on public.role_permissions
  for delete to authenticated using ((select public.has_permission('roles.manage')));

create policy "People read their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Staff with people access read profiles" on public.profiles
  for select to authenticated using ((select public.has_permission('people.read')));
create policy "People update their own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Team members read their own membership" on public.team_members
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Team managers read the team" on public.team_members
  for select to authenticated using ((select public.has_permission('team.manage')));
-- Only an owner can create, edit or remove an owner.
create policy "Team managers add members" on public.team_members
  for insert to authenticated
  with check ((select public.has_permission('team.manage')) and (role <> 'owner' or (select public.current_team_role()) = 'owner'));
create policy "Team managers change members" on public.team_members
  for update to authenticated
  using ((select public.has_permission('team.manage')) and (role <> 'owner' or (select public.current_team_role()) = 'owner'))
  with check ((select public.has_permission('team.manage')) and (role <> 'owner' or (select public.current_team_role()) = 'owner'));
create policy "Team managers remove members" on public.team_members
  for delete to authenticated
  using ((select public.has_permission('team.manage')) and (role <> 'owner' or (select public.current_team_role()) = 'owner') and user_id <> (select auth.uid()));

create policy "Staff with lead access read leads" on public.leads
  for select to authenticated using ((select public.has_permission('leads.read')));
create policy "Staff with lead access update leads" on public.leads
  for update to authenticated using ((select public.has_permission('leads.write'))) with check ((select public.has_permission('leads.write')));
create policy "Owners delete leads" on public.leads
  for delete to authenticated using ((select public.has_permission('leads.delete')));

create policy "Auditors read the audit log" on public.audit_events
  for select to authenticated using ((select public.has_permission('audit.read')));

-- ── Permission catalogue ────────────────────────────────────────────────────

insert into public.permissions (key, description) values
  ('leads.read', 'See enquiries, including contact details'),
  ('leads.write', 'Update, assign and progress enquiries'),
  ('leads.delete', 'Permanently delete an enquiry (data erasure requests)'),
  ('people.read', 'See student and team profiles'),
  ('team.manage', 'Add, change and remove team members'),
  ('roles.manage', 'Change what each role may do'),
  ('audit.read', 'Read the audit log'),
  ('documents.read', 'Open student documents (document system, later phase)'),
  ('payments.read', 'See payment milestones and payments (payments, later phase)'),
  ('reports.read', 'See aggregated reports without personal data (later phase)');

insert into public.role_permissions (role, permission) values
  ('owner', 'leads.read'), ('owner', 'leads.write'), ('owner', 'leads.delete'), ('owner', 'people.read'),
  ('owner', 'team.manage'), ('owner', 'roles.manage'), ('owner', 'audit.read'), ('owner', 'documents.read'),
  ('owner', 'payments.read'), ('owner', 'reports.read'),
  ('admin', 'leads.read'), ('admin', 'leads.write'), ('admin', 'people.read'), ('admin', 'team.manage'),
  ('admin', 'audit.read'), ('admin', 'documents.read'), ('admin', 'payments.read'), ('admin', 'reports.read'),
  ('advisor', 'leads.read'), ('advisor', 'leads.write'), ('advisor', 'people.read'), ('advisor', 'documents.read'),
  ('document_reviewer', 'documents.read'),
  ('finance', 'payments.read'), ('finance', 'reports.read'),
  -- Marketing sees aggregated reports only: no contact details, passports or finances.
  ('marketing', 'reports.read'),
  ('analyst', 'reports.read');
