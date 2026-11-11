-- Row Level Security and audit checks, run against the migrations plus seed.sql.
-- Each block acts as one principal and raises an exception when a rule does not hold.

create function pg_temp.act_as(who uuid) returns void language plpgsql as $$
begin
  reset role;
  if who is null then
    perform set_config('request.jwt.claim.sub', '', false);
    set role anon;
  else
    perform set_config('request.jwt.claim.sub', who::text, false);
    set role authenticated;
  end if;
end;
$$;

create function pg_temp.check(ok boolean, label text) returns void language plpgsql as $$
begin
  if not ok then
    raise exception 'FAILED: %', label;
  end if;
  raise notice 'ok  %', label;
end;
$$;

-- Runs a statement and reports whether the database refused it.
create function pg_temp.refused(statement text) returns boolean language plpgsql as $$
begin
  execute statement;
  return false;
exception when insufficient_privilege or check_violation then
  return true;
end;
$$;

-- Runs a statement and returns how many rows it touched.
create function pg_temp.affected(statement text) returns integer language plpgsql as $$
declare
  n integer;
begin
  execute statement;
  get diagnostics n = row_count;
  return n;
end;
$$;

\set owner   '''00000000-0000-4000-8000-000000000001'''
\set advisor '''00000000-0000-4000-8000-000000000002'''
\set student '''00000000-0000-4000-8000-000000000003'''

-- Sign-up trigger ─────────────────────────────────────────────────────────────
select pg_temp.check((select count(*) from public.profiles) = 3, 'a profile exists for every account');
select pg_temp.check((select full_name from public.profiles where id = :student) = 'Sana Student (synthetic)', 'the profile carries the name given at sign-up');
select pg_temp.check((select terms_version from public.profiles where id = :student) = 'draft-2026-11', 'the profile records the accepted terms version');

-- Signed-out visitor ─────────────────────────────────────────────────────────
select pg_temp.act_as(null);
select pg_temp.check(pg_temp.refused('select * from public.leads'), 'visitors cannot read enquiries');
select pg_temp.check(pg_temp.refused('select * from public.profiles'), 'visitors cannot read profiles');
select pg_temp.check(pg_temp.refused($$insert into public.leads (id) values (gen_random_uuid())$$), 'visitors cannot write enquiries directly');

-- Student ────────────────────────────────────────────────────────────────────
select pg_temp.act_as(:student);
select pg_temp.check((select count(*) from public.profiles) = 1, 'a student sees only their own profile');
select pg_temp.check((select count(*) from public.leads) = 0, 'a student sees no enquiries');
select pg_temp.check((select count(*) from public.team_directory()) = 0, 'a student cannot list the team');
select pg_temp.check((select count(*) from public.audit_events) = 0, 'a student sees no audit events');
select pg_temp.check((select count(*) from public.team_members) = 0, 'a student has no team membership');
select pg_temp.check(pg_temp.affected($$update public.profiles set full_name = 'Renamed' where id = '00000000-0000-4000-8000-000000000003'$$) = 1, 'a student can edit their own name');
select pg_temp.check(pg_temp.affected($$update public.profiles set full_name = 'Hijack' where id = '00000000-0000-4000-8000-000000000001'$$) = 0, 'a student cannot edit someone else''s profile');
select pg_temp.check(pg_temp.refused($$update public.profiles set terms_version = 'forged' where id = '00000000-0000-4000-8000-000000000003'$$), 'a student cannot rewrite the agreements they accepted');
select pg_temp.check(pg_temp.refused($$insert into public.team_members (user_id, role) values ('00000000-0000-4000-8000-000000000003', 'owner')$$), 'a student cannot make themselves staff');
select pg_temp.check(pg_temp.refused($$insert into public.role_permissions (role, permission) values ('analyst', 'leads.read')$$), 'a student cannot change role permissions');

-- Advisor ────────────────────────────────────────────────────────────────────
select pg_temp.act_as(:advisor);
select pg_temp.check((select count(*) from public.leads) = 3, 'an advisor sees enquiries');
select pg_temp.check(pg_temp.affected($$update public.leads set status = 'contacted' where reference = 'AP-261109-TEST1'$$) = 1, 'an advisor can progress an enquiry');
select pg_temp.check(pg_temp.affected($$update public.leads set status = 'proposal' where reference = 'AP-261109-TEST1'$$) = 1, 'an advisor can move an enquiry to the proposal stage');
select pg_temp.check(pg_temp.affected($$update public.leads set status = 'closed', lost_reason = 'Chose another consultancy' where reference = 'AP-261109-TEST2'$$) = 1, 'an advisor can mark an enquiry lost with a reason');
select pg_temp.check((select count(*) from public.team_directory()) > 0, 'an advisor can list team names to assign a lead');
select pg_temp.check(pg_temp.affected($$delete from public.leads where reference = 'AP-261109-TEST3'$$) = 0, 'an advisor cannot delete an enquiry');
select pg_temp.check((select count(*) from public.audit_events) = 0, 'an advisor cannot read the audit log');
select pg_temp.check(pg_temp.refused($$insert into public.team_members (user_id, role) values ('00000000-0000-4000-8000-000000000003', 'advisor')$$), 'an advisor cannot add team members');
select pg_temp.check((select count(*) from public.profiles) = 3, 'an advisor can see profiles');

-- Student cases: quote → open case → student sees it → finance confirms ─────
select pg_temp.act_as(:advisor);
update public.leads set email = 'student@asterpath.test' where reference = 'AP-261109-TEST3';
select pg_temp.check(pg_temp.affected($$insert into public.lead_notes (lead_id, body) select id, 'Called; consultation booked.' from public.leads where reference = 'AP-261109-TEST3'$$) = 1, 'an advisor can add a note to a lead');
select pg_temp.check(pg_temp.refused($$insert into public.lead_notes (lead_id, author_id, body) select id, '00000000-0000-4000-8000-000000000001', 'Forged' from public.leads where reference = 'AP-261109-TEST3'$$), 'an advisor cannot write a note as someone else');
insert into public.quotes (lead_id, level, inputs, breakdown, total)
  select id, 'masters', '{}', '{"instalments":[{"stage":"Onboarding","amount":30000},{"stage":"Applications","amount":25000},{"stage":"Admission","amount":15000},{"stage":"Visa","amount":20000},{"stage":"Arrival","amount":10000}]}', 100000
  from public.leads where reference = 'AP-261109-TEST3';
select public.open_case((select id from public.leads where reference = 'AP-261109-TEST3'), (select id from public.quotes limit 1));
select pg_temp.check((select status from public.leads where reference = 'AP-261109-TEST3') = 'converted', 'opening a case converts the lead');
select pg_temp.check((select status from public.student_cases) = 'awaiting_payment', 'a new case waits for its first instalment');
select pg_temp.check(pg_temp.affected($$insert into public.case_tasks (case_id, title) select id, 'Upload mark sheets' from public.student_cases$$) = 1, 'an advisor can set a student task');
select pg_temp.check((select count(*) from public.instalments) = 0, 'an advisor cannot see payment records');
select pg_temp.check(pg_temp.affected($$update public.instalments set status = 'waived'$$) = 0, 'an advisor cannot change payments');

select pg_temp.act_as(:student);
select pg_temp.check((select count(*) from public.student_cases) = 0, 'a student sees no case before it is linked to them');
select public.claim_my_case();
select pg_temp.check((select count(*) from public.student_cases) = 1, 'a student with the matching verified email is linked to their case');
select pg_temp.check((select count(*) from public.instalments) = 5, 'a student sees their own instalments');
select pg_temp.check((select count(*) from public.case_tasks) = 1, 'a student sees their own tasks');
select pg_temp.check((select count(*) from public.quotes) = 0 and (select count(*) from public.lead_notes) = 0, 'a student sees no quotes or internal notes');
select pg_temp.check(pg_temp.affected($$update public.instalments set status = 'paid', paid_at = now(), payment_reference = 'fake', confirmed_by = '00000000-0000-4000-8000-000000000003'$$) = 0, 'a student cannot mark their own instalment paid');
select pg_temp.check(pg_temp.affected($$update public.student_cases set stage = 'arrival'$$) = 0, 'a student cannot move their own case');

select pg_temp.act_as(:owner);
select pg_temp.check(pg_temp.refused($$update public.instalments set status = 'paid' where position = 1$$), 'an instalment cannot be marked paid without a reference and confirmer');
select pg_temp.check(pg_temp.affected($$update public.instalments set status = 'paid', paid_at = now(), payment_reference = 'UTR 1234', confirmed_by = '00000000-0000-4000-8000-000000000001' where position = 1$$) = 1, 'the owner can confirm a payment with its reference');
select pg_temp.check((select status from public.student_cases) = 'active', 'confirming the first instalment activates the case');

-- Applications and referrals on that case ───────────────────────────────────
select pg_temp.act_as(:advisor);
select pg_temp.check(pg_temp.affected($$insert into public.case_applications (case_id, university, programme, deadline) select id, 'Politecnico di Milano', 'MSc Data Science', current_date + 60 from public.student_cases$$) = 1, 'an advisor can add a university application');
select pg_temp.act_as(:student);
select pg_temp.check((select count(*) from public.case_applications) = 1, 'a student sees their own applications');
select pg_temp.check(pg_temp.affected($$update public.case_applications set status = 'admitted'$$) = 0, 'a student cannot change an application status');
select pg_temp.check((select referral_code from public.student_cases) ~ '^[A-Z0-9]{8}$', 'every case gets a shareable referral code');
reset role;
insert into public.referrals (referral_code, referrer_case_id) select referral_code, id from public.student_cases;
select pg_temp.act_as(:student);
select pg_temp.check((select count(*) from public.referrals) = 1, 'a referring student sees their code was used');
select pg_temp.check(pg_temp.affected($$update public.referrals set status = 'approved', reward_amount = 5000$$) = 0, 'a student cannot approve their own referral credit');
select pg_temp.act_as(:advisor);
select pg_temp.check(pg_temp.affected($$update public.referrals set status = 'approved', reward_amount = 5000$$) = 0, 'an advisor cannot approve a referral credit');
select pg_temp.act_as(:owner);
select pg_temp.check(pg_temp.affected($$update public.referrals set status = 'approved', reward_amount = 5000, decided_by = '00000000-0000-4000-8000-000000000001', decided_at = now()$$) = 1, 'the owner can approve a referral credit');

-- Bookings (written only by the Cal.com webhook with the service role) ──────
reset role;
insert into public.bookings (cal_uid, starts_at, attendee_name, attendee_email, meeting_url)
  values ('cal-test-1', now() + interval '2 days', 'Synthetic Booker', 'booker@asterpath.test', 'https://meet.google.com/aaa-bbbb-ccc');
select pg_temp.check(pg_temp.refused($$insert into public.bookings (cal_uid, starts_at, attendee_name, attendee_email, meeting_url) values ('bad', now(), 'X', 'x@example.com', 'javascript:alert(1)')$$), 'even the webhook cannot store a non-https meeting link');
select pg_temp.act_as(:student);
select pg_temp.check((select count(*) from public.bookings) = 0, 'a student cannot see booked calls');
select pg_temp.act_as(:advisor);
select pg_temp.check((select count(*) from public.bookings) = 1, 'an advisor sees booked calls');
select pg_temp.check(pg_temp.refused($$insert into public.bookings (cal_uid, starts_at, attendee_name, attendee_email) values ('forged', now(), 'X', 'x@example.com')$$), 'staff cannot create bookings directly');

-- Website analytics (anonymous; written only by /api/events with the service role) ─
reset role;
insert into public.site_events (session_id, name, path, source, device) values
  ('6f1c3a52-2b7d-4c1e-9d55-0a4c1b2e3f40', 'pageview', '/', 'instagram', 'mobile'),
  ('6f1c3a52-2b7d-4c1e-9d55-0a4c1b2e3f40', 'enquiry_submitted', '/contact', 'instagram', 'mobile');
select pg_temp.act_as(:student);
select pg_temp.check((select count(*) from public.site_events) = 0, 'a student cannot read website analytics');
select pg_temp.act_as(:advisor);
select pg_temp.check((select count(*) from public.site_events) = 0, 'an advisor without report access cannot read website analytics');
select pg_temp.check(pg_temp.refused($$insert into public.site_events (session_id, name, path, device) values (gen_random_uuid(), 'pageview', '/', 'mobile')$$), 'nobody signed in can write analytics events directly');

-- Owner ──────────────────────────────────────────────────────────────────────
select pg_temp.act_as(:owner);
select pg_temp.check((select count(*) from public.team_members) = 2, 'the owner sees the whole team');
select pg_temp.check(pg_temp.affected($$insert into public.team_members (user_id, role) values ('00000000-0000-4000-8000-000000000003', 'admin')$$) = 1, 'the owner can add an admin');
select pg_temp.check(pg_temp.affected($$delete from public.team_members where user_id = '00000000-0000-4000-8000-000000000001'$$) = 0, 'the owner cannot remove themselves');
select pg_temp.check((public.marketing_summary(30) ->> 'visits')::int = 1 and (public.marketing_summary(30) ->> 'enquiries')::int = 1, 'the owner sees the visit and enquiry counts');
select pg_temp.check((public.marketing_summary(30) -> 'channels' -> 0 ->> 'channel') = 'instagram', 'visits are grouped by the channel that sent them');
select pg_temp.check(pg_temp.refused('update public.audit_events set action = ''delete'''), 'nobody can edit the audit log');
select pg_temp.check(pg_temp.refused('delete from public.audit_events'), 'nobody can delete from the audit log');

-- The new admin (the student account, promoted above) ────────────────────────
select pg_temp.act_as(:student);
select pg_temp.check((select count(*) from public.leads) = 3, 'an admin sees enquiries');
select set_config('request.jwt.claim.aal', 'aal1', false);
select pg_temp.check((select count(*) from public.leads) = 0, 'staff signed in with a password only (no second factor) see no enquiries');
select pg_temp.check(not public.has_permission('leads.read'), 'staff without a second factor hold no permissions');
select set_config('request.jwt.claim.aal', '', false);
select pg_temp.check(pg_temp.refused($$update public.team_members set role = 'owner' where user_id = '00000000-0000-4000-8000-000000000003'$$), 'an admin cannot promote themselves to owner');
select pg_temp.check(pg_temp.affected($$update public.team_members set role = 'analyst' where user_id = '00000000-0000-4000-8000-000000000001'$$) = 0, 'an admin cannot demote the owner');

-- Audit trail ────────────────────────────────────────────────────────────────
select pg_temp.act_as(:owner);
select pg_temp.check(
  exists (
    select 1 from public.audit_events
    where entity = 'leads' and action = 'update' and actor_id = :advisor
      and changed_columns = array['status'] and details is null
  ),
  'an enquiry change is logged with who and which column, but not the personal data'
);
select pg_temp.check(
  exists (
    select 1 from public.audit_events
    where entity = 'team_members' and action = 'insert' and actor_id = :owner and details -> 'new' ->> 'role' = 'admin'
  ),
  'a team change is logged with its old and new values'
);

-- Staff usernames ────────────────────────────────────────────────────────────
reset role;
update public.team_members set username = 'OwnerOne' where user_id = :owner;
select pg_temp.act_as(:owner);
select pg_temp.check(pg_temp.refused($$select public.staff_email_for_username('OwnerOne')$$), 'signed-in users cannot look up a staff email from a username');
select pg_temp.act_as(null);
select pg_temp.check(pg_temp.refused($$select public.staff_email_for_username('OwnerOne')$$), 'the public cannot look up a staff email from a username');
reset role;
set role service_role;
select pg_temp.check(public.staff_email_for_username('ownerone') is not null, 'the server finds a staff email by username, ignoring case');
select pg_temp.check(public.staff_email_for_username('nobody') is null, 'an unknown username finds nothing');
reset role;
update public.team_members set active = false where user_id = :owner;
set role service_role;
select pg_temp.check(public.staff_email_for_username('OwnerOne') is null, 'a deactivated member cannot sign in by username');
reset role;
update public.team_members set active = true where user_id = :owner;

reset role;
\echo 'All RLS checks passed.'
