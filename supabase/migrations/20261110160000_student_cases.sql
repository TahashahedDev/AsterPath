-- From signed agreement to a live case the student can see.
--   lead_notes     notes staff add to an enquiry
--   quotes         saved written figures (computed on the server from the rate card)
--   student_cases  one case per converted lead, linked to the student's account
--   instalments    the payment schedule; finance confirms each against the bank or
--                  Razorpay record and types its reference (no online collection)
--   case_tasks     what the student has to do next, shown in their portal
-- A case opens as 'awaiting_payment' and becomes 'active' when the first
-- instalment is confirmed. Additive only: RLS on every table, explicit grants,
-- and an audit trigger on each (personal tables log column names, never values).
--
-- Rollback:
--   drop table public.case_tasks, public.instalments, public.student_cases, public.quotes, public.lead_notes;
--   drop function public.open_case(uuid, uuid), public.claim_my_case(), public.activate_case_on_first_payment();
--   delete from public.role_permissions where permission in ('cases.write', 'payments.write');
--   delete from public.permissions where key in ('cases.write', 'payments.write');

insert into public.permissions (key, description) values
  ('cases.write', 'Open student cases, move their stage and set their tasks'),
  ('payments.write', 'Confirm, schedule and waive instalments');

insert into public.role_permissions (role, permission) values
  ('owner', 'cases.write'), ('owner', 'payments.write'),
  ('admin', 'cases.write'), ('admin', 'payments.write'),
  ('advisor', 'cases.write'),
  ('finance', 'payments.write');

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index lead_notes_lead_idx on public.lead_notes (lead_id, created_at);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  level text not null check (level in ('bachelors', 'masters', 'phd')),
  inputs jsonb not null,
  breakdown jsonb not null,
  total integer not null check (total > 0),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index quotes_lead_idx on public.quotes (lead_id, created_at);

create table public.student_cases (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid unique references public.leads (id) on delete set null,
  quote_id uuid references public.quotes (id) on delete set null,
  student_user_id uuid references auth.users (id) on delete set null,
  student_email extensions.citext not null check (char_length(student_email) <= 254),
  full_name text not null check (char_length(full_name) between 1 and 120),
  advisor_id uuid references public.team_members (user_id) on delete set null,
  destination text not null check (char_length(destination) <= 20),
  level text not null check (char_length(level) <= 40),
  intake text not null check (char_length(intake) <= 40),
  stage text not null default 'profile'
    check (stage in ('profile', 'shortlist', 'applications', 'admission', 'pre_enrolment', 'enrolment', 'visa', 'departure', 'arrival')),
  status text not null default 'awaiting_payment' check (status in ('awaiting_payment', 'active', 'closed')),
  opened_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index student_cases_student_idx on public.student_cases (student_user_id);
create index student_cases_email_idx on public.student_cases (student_email) where student_user_id is null;

create table public.instalments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.student_cases (id) on delete cascade,
  position smallint not null check (position between 1 and 10),
  stage text not null check (char_length(stage) <= 40),
  amount integer not null check (amount >= 0),
  status text not null default 'upcoming' check (status in ('upcoming', 'due', 'paid', 'waived')),
  due_on date,
  paid_at timestamptz,
  payment_reference text check (char_length(payment_reference) <= 80),
  confirmed_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (case_id, position),
  -- A payment is only "paid" with a recorded reference and who confirmed it.
  check (status <> 'paid' or (paid_at is not null and payment_reference is not null and confirmed_by is not null))
);

create table public.case_tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.student_cases (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  due_on date,
  done boolean not null default false,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index case_tasks_case_idx on public.case_tasks (case_id);

-- ── Access ──────────────────────────────────────────────────────────────────

alter table public.lead_notes enable row level security;
alter table public.quotes enable row level security;
alter table public.student_cases enable row level security;
alter table public.instalments enable row level security;
alter table public.case_tasks enable row level security;

revoke all on public.lead_notes, public.quotes, public.student_cases, public.instalments, public.case_tasks from anon, authenticated;
grant select, insert on public.lead_notes, public.quotes to authenticated;
grant select, insert, update on public.student_cases, public.instalments, public.case_tasks to authenticated;

create policy "Lead staff read notes" on public.lead_notes
  for select to authenticated using ((select public.has_permission('leads.read')));
create policy "Lead staff add their own notes" on public.lead_notes
  for insert to authenticated with check ((select public.has_permission('leads.write')) and author_id = (select auth.uid()));

create policy "Lead staff read quotes" on public.quotes
  for select to authenticated using ((select public.has_permission('leads.read')));
create policy "Lead staff save quotes" on public.quotes
  for insert to authenticated with check ((select public.has_permission('leads.write')) and created_by = (select auth.uid()));

create policy "Staff read cases; students read their own" on public.student_cases
  for select to authenticated using ((select public.has_permission('people.read')) or student_user_id = (select auth.uid()));
create policy "Case staff open cases" on public.student_cases
  for insert to authenticated with check ((select public.has_permission('cases.write')));
create policy "Case staff update cases" on public.student_cases
  for update to authenticated using ((select public.has_permission('cases.write'))) with check ((select public.has_permission('cases.write')));

create policy "Finance reads instalments; students read their own" on public.instalments
  for select to authenticated using (
    (select public.has_permission('payments.read'))
    or exists (select 1 from public.student_cases sc where sc.id = case_id and sc.student_user_id = (select auth.uid()))
  );
create policy "Case staff create the schedule" on public.instalments
  for insert to authenticated with check ((select public.has_permission('cases.write')));
create policy "Finance updates instalments" on public.instalments
  for update to authenticated using ((select public.has_permission('payments.write'))) with check ((select public.has_permission('payments.write')));

create policy "Staff read tasks; students read their own" on public.case_tasks
  for select to authenticated using (
    (select public.has_permission('people.read'))
    or exists (select 1 from public.student_cases sc where sc.id = case_id and sc.student_user_id = (select auth.uid()))
  );
create policy "Case staff add tasks" on public.case_tasks
  for insert to authenticated with check ((select public.has_permission('cases.write')));
create policy "Case staff update tasks" on public.case_tasks
  for update to authenticated using ((select public.has_permission('cases.write'))) with check ((select public.has_permission('cases.write')));

-- ── Functions ───────────────────────────────────────────────────────────────

-- Opens a case from a lead and one of its saved quotes, creates the instalment
-- schedule from that quote (first instalment due) and marks the lead converted.
-- Runs as the caller, so every write is checked by the policies above.
create function public.open_case(p_lead uuid, p_quote uuid) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  l public.leads;
  q public.quotes;
  new_case uuid;
begin
  if not public.has_permission('cases.write') then
    raise exception 'not allowed to open cases' using errcode = '42501';
  end if;
  select * into l from public.leads where id = p_lead;
  if not found then raise exception 'lead not found' using errcode = 'P0002'; end if;
  select * into q from public.quotes where id = p_quote and lead_id = p_lead;
  if not found then raise exception 'quote not found for this lead' using errcode = 'P0002'; end if;

  insert into public.student_cases (lead_id, quote_id, student_email, full_name, advisor_id, destination, level, intake)
  values (l.id, q.id, l.email, l.full_name, l.assigned_to, l.destination, l.level, l.intake)
  returning id into new_case;

  insert into public.instalments (case_id, position, stage, amount, status)
  select new_case, t.ord, t.x ->> 'stage', (t.x ->> 'amount')::integer, case when t.ord = 1 then 'due' else 'upcoming' end
  from jsonb_array_elements(q.breakdown -> 'instalments') with ordinality as t(x, ord);

  update public.leads set status = 'converted', lost_reason = null where id = p_lead;
  return new_case;
end;
$$;
revoke execute on function public.open_case(uuid, uuid) from public, anon;
grant execute on function public.open_case(uuid, uuid) to authenticated;

-- Links a case to the signed-in student when their verified email matches the
-- email on the case. Called when the student opens the portal.
create function public.claim_my_case() returns void
language sql security definer set search_path = '' as $$
  update public.student_cases sc
     set student_user_id = u.id
    from auth.users u
   where u.id = (select auth.uid())
     and u.email_confirmed_at is not null
     and sc.student_user_id is null
     and sc.student_email = u.email::extensions.citext
$$;
revoke execute on function public.claim_my_case() from public, anon;
grant execute on function public.claim_my_case() to authenticated;

-- The case goes live when finance confirms the first instalment.
create function public.activate_case_on_first_payment() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.position = 1 and new.status = 'paid' and old.status is distinct from 'paid' then
    update public.student_cases set status = 'active' where id = new.case_id and status = 'awaiting_payment';
  end if;
  return new;
end;
$$;
revoke execute on function public.activate_case_on_first_payment() from public, anon, authenticated;

-- ── Triggers ────────────────────────────────────────────────────────────────

create trigger student_cases_updated_at before update on public.student_cases for each row execute function public.set_updated_at();
create trigger instalments_updated_at before update on public.instalments for each row execute function public.set_updated_at();
create trigger instalments_activate_case after update on public.instalments for each row execute function public.activate_case_on_first_payment();

create trigger lead_notes_audit after insert or update or delete on public.lead_notes
  for each row execute function public.audit_row_change('personal', 'id');
create trigger quotes_audit after insert or update or delete on public.quotes
  for each row execute function public.audit_row_change('plain', 'id');
create trigger student_cases_audit after insert or update or delete on public.student_cases
  for each row execute function public.audit_row_change('personal', 'id');
create trigger instalments_audit after insert or update or delete on public.instalments
  for each row execute function public.audit_row_change('plain', 'id');
create trigger case_tasks_audit after insert or update or delete on public.case_tasks
  for each row execute function public.audit_row_change('personal', 'id');
