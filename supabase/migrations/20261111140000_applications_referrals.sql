-- University applications per student case, and referrals.
--   case_applications  each university a student applies to, with deadline and status;
--                      staff manage them, the student sees their own in the portal
--   student_cases.referral_code  a short code each student can share
--   referrals          an enquiry that arrived with a referral code; finance
--                      approves or declines the referral credit (pricing rules)
-- Additive only: RLS on, explicit grants, audit triggers.
--
-- Rollback:
--   drop table public.referrals, public.case_applications;
--   alter table public.student_cases drop column referral_code;

create table public.case_applications (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.student_cases (id) on delete cascade,
  university text not null check (char_length(university) between 1 and 160),
  programme text not null check (char_length(programme) between 1 and 200),
  deadline date,
  status text not null default 'planned'
    check (status in ('planned', 'in_preparation', 'submitted', 'under_review', 'admitted', 'waitlisted', 'rejected', 'withdrawn')),
  submitted_on date,
  portal_reference text check (char_length(portal_reference) <= 80),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index case_applications_case_idx on public.case_applications (case_id);
create index case_applications_deadline_idx on public.case_applications (deadline);

alter table public.student_cases
  add column referral_code text unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
    check (referral_code ~ '^[A-Z0-9]{6,12}$');

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null check (char_length(referral_code) <= 12),
  referrer_case_id uuid not null references public.student_cases (id) on delete cascade,
  lead_id uuid unique references public.leads (id) on delete set null,
  status text not null default 'enquired' check (status in ('enquired', 'approved', 'declined')),
  reward_amount integer check (reward_amount >= 0),
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index referrals_referrer_idx on public.referrals (referrer_case_id);

alter table public.case_applications enable row level security;
alter table public.referrals enable row level security;
revoke all on public.case_applications, public.referrals from anon, authenticated;
grant select, insert, update on public.case_applications to authenticated;
grant select, update on public.referrals to authenticated;

create policy "Staff read applications; students read their own" on public.case_applications
  for select to authenticated using (
    (select public.has_permission('people.read'))
    or exists (select 1 from public.student_cases sc where sc.id = case_id and sc.student_user_id = (select auth.uid()))
  );
create policy "Case staff add applications" on public.case_applications
  for insert to authenticated with check ((select public.has_permission('cases.write')));
create policy "Case staff update applications" on public.case_applications
  for update to authenticated using ((select public.has_permission('cases.write'))) with check ((select public.has_permission('cases.write')));

-- Referrals are created by the enquiry endpoint (service role). Staff see them;
-- a referring student sees that their code was used, never who used it.
create policy "Staff read referrals; referrers read their own" on public.referrals
  for select to authenticated using (
    (select public.has_permission('people.read'))
    or (select public.has_permission('payments.read'))
    or exists (select 1 from public.student_cases sc where sc.id = referrer_case_id and sc.student_user_id = (select auth.uid()))
  );
create policy "Finance decides referral credits" on public.referrals
  for update to authenticated using ((select public.has_permission('payments.write'))) with check ((select public.has_permission('payments.write')));

create trigger case_applications_updated_at before update on public.case_applications for each row execute function public.set_updated_at();
create trigger referrals_updated_at before update on public.referrals for each row execute function public.set_updated_at();
create trigger case_applications_audit after insert or update or delete on public.case_applications
  for each row execute function public.audit_row_change('personal', 'id');
create trigger referrals_audit after insert or update or delete on public.referrals
  for each row execute function public.audit_row_change('plain', 'id');
