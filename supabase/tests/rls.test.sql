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

-- Runs a statement and reports whether the database rejected it for any reason
-- (permissions, a broken rule in a function, an invalid state change).
create function pg_temp.fails(statement text) returns boolean language plpgsql as $$
begin
  execute statement;
  return false;
exception when others then
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
-- Different capitals from the student's sign-in email: matching must ignore case.
update public.leads set email = 'Student@AsterPath.test' where reference = 'AP-261109-TEST3';
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

-- Document vault ─────────────────────────────────────────────────────────────
reset role;
\set studentA  '''00000000-0000-4000-8000-0000000000a1'''
\set studentB  '''00000000-0000-4000-8000-0000000000b1'''
\set finance   '''00000000-0000-4000-8000-0000000000f1'''
\set marketing '''00000000-0000-4000-8000-0000000000e1'''
\set reviewer  '''00000000-0000-4000-8000-0000000000d1'''
\set caseA     '''00000000-0000-4000-8000-00000000ca5a'''
\set caseB     '''00000000-0000-4000-8000-00000000ca5b'''
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  (:studentA, 'a@students.test', now(), '{"full_name":"Student A (synthetic)"}'),
  (:studentB, 'b@students.test', now(), '{"full_name":"Student B (synthetic)"}'),
  (:finance, 'finance@asterpath.test', now(), '{}'),
  (:marketing, 'marketing@asterpath.test', now(), '{}'),
  (:reviewer, 'reviewer@asterpath.test', now(), '{}');
insert into public.team_members (user_id, role) values (:finance, 'finance'), (:marketing, 'marketing'), (:reviewer, 'document_reviewer');
insert into public.student_cases (id, student_user_id, student_email, full_name, destination, level, intake) values
  (:caseA, :studentA, 'a@students.test', 'Student A (synthetic)', 'italy', 'masters', 'autumn-2027'),
  (:caseB, :studentB, 'b@students.test', 'Student B (synthetic)', 'italy', 'masters', 'autumn-2027');

select pg_temp.check((select not public and file_size_limit = 10485760 and allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'] from storage.buckets where id = 'student-documents'), 'the document bucket is private, 10 MB, PDF/JPEG/PNG only');

select pg_temp.act_as(:advisor);
select pg_temp.check(pg_temp.affected($$insert into public.document_requests (case_id, type_key, title) values ('00000000-0000-4000-8000-00000000ca5a', 'transcripts', 'All semester mark sheets')$$) = 1, 'an advisor can ask a student for a document');
select pg_temp.check(pg_temp.affected($$insert into public.document_requests (case_id, type_key, title) values ('00000000-0000-4000-8000-00000000ca5a', 'financial_statement', 'Six months of bank statements')$$) = 1, 'an advisor can ask for a financial document');
select pg_temp.check(pg_temp.refused($$insert into public.document_requests (case_id, type_key, title, status) values ('00000000-0000-4000-8000-00000000ca5a', 'cv', 'CV', 'approved')$$), 'nobody can create a request with a chosen status');

select pg_temp.act_as(:marketing);
select pg_temp.check((select count(*) from public.document_requests) = 0, 'marketing sees no document requests');
select pg_temp.check(pg_temp.fails($$insert into public.document_requests (case_id, type_key, title) values ('00000000-0000-4000-8000-00000000ca5a', 'cv', 'CV')$$), 'marketing cannot ask for documents');

reset role;
select id as request_a from public.document_requests where type_key = 'transcripts' \gset
select pg_temp.act_as(:studentB);
select pg_temp.check((select count(*) from public.document_requests) = 0, 'a student sees no other student''s documents');
select pg_temp.check(pg_temp.refused(format('select * from public.begin_document_upload(%L::uuid, %L)', :'request_a', 'x.pdf')), 'a student cannot upload into another student''s request, even knowing its id');

select pg_temp.act_as(null);
select pg_temp.check(pg_temp.refused($$select * from public.document_requests$$), 'visitors cannot read document requests');
select pg_temp.check(pg_temp.fails($$select * from public.begin_document_upload(gen_random_uuid(), 'x.pdf')$$), 'visitors cannot start an upload');

select pg_temp.act_as(:studentA);
select pg_temp.check((select count(*) from public.document_requests) = 2, 'a student sees the documents requested from them');
select pg_temp.check(pg_temp.refused($$update public.document_requests set status = 'approved'$$), 'a student cannot set a document''s status');
select pg_temp.check(pg_temp.fails($$insert into public.document_requests (case_id, type_key, title) values ('00000000-0000-4000-8000-00000000ca5a', 'cv', 'CV')$$), 'a student cannot create requests');
create temp table up1 as select * from public.begin_document_upload((select id from public.document_requests where type_key = 'transcripts'), 'Marks/../../evil<>.pdf');
grant select on up1 to public;
select pg_temp.check((select upload_path like 'quarantine/00000000-0000-4000-8000-00000000ca5a/%' and upload_path !~ 'pdf|evil' from up1), 'the server chooses the upload path: quarantine, inside the student''s own case, no file name');
select pg_temp.check((select storage_path = substr(upload_path, 12) from public.document_versions where id = (select version_id from up1)), 'the verified file lives at a path no upload URL is issued for');
select pg_temp.check((select original_filename !~ '[/<>]' from public.document_versions where id = (select version_id from up1)), 'the original file name is sanitised');
select pg_temp.check(pg_temp.fails($$select public.complete_document_upload((select version_id from up1), 'application/pdf', 1000, repeat('a', 64))$$), 'a student cannot mark their own upload as verified');
select pg_temp.check(pg_temp.fails($$select public.document_review_action((select id from public.document_requests where type_key = 'transcripts'), 'approved', '', (select version_id from up1))$$), 'a student cannot approve their own document');

reset role;
set role service_role;
select public.complete_document_upload((select version_id from up1), 'application/pdf', 2048, repeat('a', 64));
reset role;
select pg_temp.check((select status from public.document_requests where type_key = 'transcripts') = 'uploaded', 'a verified upload marks the document uploaded');

select pg_temp.act_as(:advisor);
select pg_temp.check(pg_temp.fails($$select public.document_review_action((select id from public.document_requests where type_key = 'transcripts'), 'approved', '', (select version_id from up1))$$), 'a document cannot be approved before anyone has opened it');
select pg_temp.check((select storage_path like '00000000-0000-4000-8000-00000000ca5a/%' and download_name ~ '\.pdf$' and download_name !~ '[<>/]' from public.authorize_document_download((select version_id from up1), 'preview')), 'an advisor can open a student''s transcripts; the server names the download from the verified type');
select pg_temp.check((select status from public.document_requests where type_key = 'transcripts') = 'under_review', 'opening a new upload starts its review');
select pg_temp.check(pg_temp.fails($$select public.document_review_action((select id from public.document_requests where type_key = 'transcripts'), 'rejected', '', (select version_id from up1))$$), 'a rejection must say what is wrong');
select pg_temp.check(pg_temp.fails($$select public.document_review_action((select id from public.document_requests where type_key = 'transcripts'), 'rejected', 'Missing pages.', gen_random_uuid())$$), 'a decision on a file must name the version the reviewer opened');
select pg_temp.check(public.document_review_action((select id from public.document_requests where type_key = 'transcripts'), 'rejected', 'Semester 4 is missing.', (select version_id from up1)) = 'rejected', 'an advisor can reject with feedback');

select pg_temp.act_as(:studentA);
select pg_temp.check(pg_temp.fails($$select * from public.begin_document_upload((select id from public.document_requests where type_key = 'transcripts'), 'again.pdf')$$), 'a rejected document needs a replacement request before a new upload');
select pg_temp.check((select note from public.document_reviews where action = 'rejected') = 'Semester 4 is missing.', 'the student reads the reviewer''s feedback');
select pg_temp.check(not exists (select 1 from public.document_reviews where action = 'opened'), 'the student does not see internal review events');

select pg_temp.act_as(:advisor);
select public.document_review_action((select id from public.document_requests where type_key = 'transcripts'), 'reupload_required', 'Please include all eight semesters.');
select pg_temp.act_as(:studentA);
create temp table up2 as select * from public.begin_document_upload((select id from public.document_requests where type_key = 'transcripts'), 'all-semesters.pdf');
grant select on up2 to public;
reset role;
set role service_role;
select public.complete_document_upload((select version_id from up2), 'application/pdf', 4096, repeat('b', 64));
reset role;
select pg_temp.check((select state from public.document_versions where id = (select version_id from up1)) = 'superseded', 'a replacement keeps the previous version, marked superseded');
select pg_temp.check((select current_version from public.document_requests where type_key = 'transcripts') = 2, 'the replacement becomes version 2');

-- Financial documents: only owner, admin and finance open them.
select pg_temp.act_as(:studentA);
create temp table upf as select * from public.begin_document_upload((select id from public.document_requests where type_key = 'financial_statement'), 'bank.pdf');
grant select on upf to public;
reset role;
set role service_role;
select public.complete_document_upload((select version_id from upf), 'application/pdf', 4096, repeat('c', 64));
select pg_temp.act_as(:advisor);
select pg_temp.check((select count(*) from public.document_requests where type_key = 'financial_statement') = 1, 'an advisor sees that a financial document exists');
select pg_temp.check((select count(*) from public.document_versions where request_id = (select id from public.document_requests where type_key = 'financial_statement')) = 0, 'an advisor cannot see financial file records');
select pg_temp.check(pg_temp.fails($$select public.authorize_document_download((select version_id from upf), 'preview')$$), 'an advisor cannot open a financial document');
select pg_temp.check(pg_temp.fails($$select public.document_review_action((select id from public.document_requests where type_key = 'financial_statement'), 'approved', '')$$), 'an advisor cannot review a financial document');
select pg_temp.act_as(:reviewer);
select pg_temp.check(pg_temp.fails($$select public.authorize_document_download((select version_id from upf), 'preview')$$), 'a document reviewer cannot open a financial document');
select pg_temp.check(exists (select 1 from public.authorize_document_download((select version_id from up2), 'preview')), 'a document reviewer can open standard documents');
select pg_temp.act_as(:finance);
select pg_temp.check(exists (select 1 from public.authorize_document_download((select version_id from upf), 'preview')), 'finance can open a financial document');
select pg_temp.check((select count(*) from public.document_requests) = 1, 'finance sees only financial document requests');
select pg_temp.check(pg_temp.fails($$select public.authorize_document_download((select version_id from up2), 'preview')$$), 'finance cannot open academic documents');
select pg_temp.act_as(:marketing);
select pg_temp.check(pg_temp.fails($$select public.authorize_document_download((select version_id from upf), 'preview')$$), 'marketing cannot open financial records');
select pg_temp.check((select count(*) from public.document_versions) = 0, 'marketing sees no file records');
select pg_temp.act_as(:studentB);
select pg_temp.check(pg_temp.fails($$select public.authorize_document_download((select version_id from up2), 'download')$$), 'a student cannot download another student''s file');
select pg_temp.act_as(:studentA);
select pg_temp.check(exists (select 1 from public.authorize_document_download((select version_id from upf), 'download')), 'a student can download their own file');

-- Approval, expiry, audit, withdrawal, retention.
select pg_temp.act_as(:reviewer);
select pg_temp.check(public.document_review_action((select id from public.document_requests where type_key = 'transcripts'), 'approved', '', (select version_id from up2)) = 'approved', 'a reviewer can approve after opening');
reset role;
select pg_temp.check(
  (select count(*) from public.audit_events where entity = 'document_reviews' and action = 'insert') = (select count(*) from public.document_reviews),
  'every review event is in the audit log'
);
select pg_temp.check((select count(*) from public.document_access_log where purpose = 'preview') = 3 and (select count(*) from public.document_access_log where purpose = 'download') = 1, 'every file opened is in the access log; refused attempts leave no access');
update public.document_requests set expires_on = current_date - 1 where type_key = 'transcripts';
set role service_role;
select pg_temp.check(public.expire_documents() = 1, 'approved documents past their expiry date expire');
reset role;
select pg_temp.check((select status from public.document_requests where type_key = 'transcripts') = 'expired', 'the expired document asks for a new copy');
select pg_temp.act_as(:advisor);
select pg_temp.check(public.document_review_action((select id from public.document_requests where type_key = 'financial_statement'), 'withdrawn', '') = 'withdrawn', 'staff can withdraw a request');
select pg_temp.check(pg_temp.fails($$select public.mark_document_version_deleted((select version_id from up2))$$), 'staff cannot delete file records directly');

-- Review findings: stale uploads, case ownership, retention clock, type sensitivity, request integrity.
select pg_temp.act_as(:advisor);
select pg_temp.check(pg_temp.affected($$insert into public.document_requests (case_id, type_key, title) values ('00000000-0000-4000-8000-00000000ca5a', 'cv', 'Updated CV')$$) = 1, 'an advisor asks for a CV');
select pg_temp.act_as(:studentA);
create temp table cv1 as select * from public.begin_document_upload((select id from public.document_requests where type_key = 'cv'), 'cv.pdf');
grant select on cv1 to public;
create temp table cv2 as select * from public.begin_document_upload((select id from public.document_requests where type_key = 'cv'), 'cv-final.pdf');
grant select on cv2 to public;
reset role;
set role service_role;
select pg_temp.check(pg_temp.fails($$select public.complete_document_upload((select version_id from cv1), 'application/pdf', 100, repeat('d', 64))$$), 'an older upload attempt can''t complete once a newer one started');
reset role;
select pg_temp.act_as(:advisor);
select public.document_review_action((select id from public.document_requests where type_key = 'cv'), 'withdrawn', '');
reset role;
set role service_role;
select pg_temp.check(pg_temp.fails($$select public.complete_document_upload((select version_id from cv2), 'application/pdf', 100, repeat('d', 64))$$), 'an upload can''t complete after the request was withdrawn');
reset role;
update public.document_versions set created_at = now() - interval '4 hours' where request_id = (select id from public.document_requests where type_key = 'cv');
set role service_role;
select pg_temp.check((select count(*) from public.stale_document_uploads() where state in ('pending', 'abandoned')) = 2, 'expired upload attempts are found for clean-up');
select public.mark_upload_cleaned(version_id) from public.stale_document_uploads();
select pg_temp.check((select count(*) from public.stale_document_uploads()) = 0, 'cleaned uploads are not listed again');
reset role;

select pg_temp.act_as(:advisor);
select pg_temp.check(pg_temp.refused($$update public.student_cases set closed_at = '2000-01-01' where id = '00000000-0000-4000-8000-00000000ca5a'$$), 'staff cannot set when a case closed (it decides when files are deleted)');
select pg_temp.check(pg_temp.refused($$update public.student_cases set student_user_id = '00000000-0000-4000-8000-0000000000b1' where id = '00000000-0000-4000-8000-00000000ca5a'$$), 'staff cannot hand a case to another account');
select pg_temp.check(pg_temp.refused($$update public.student_cases set student_email = 'someone@else.test' where id = '00000000-0000-4000-8000-00000000ca5a'$$), 'staff cannot change the email a case is claimed by');
select pg_temp.check(pg_temp.fails($$insert into public.document_requests (case_id, type_key, title, application_id) values ('00000000-0000-4000-8000-00000000ca5b', 'cv', 'CV', (select id from public.case_applications limit 1))$$) or not exists (select 1 from public.case_applications), 'a request can''t link an application from another case');
select pg_temp.act_as(:student);
select pg_temp.fails($$update public.document_types set sensitivity = 'standard' where key = 'financial_statement'$$);
reset role;
select pg_temp.check((select sensitivity from public.document_types where key = 'financial_statement') = 'financial', 'an admin cannot downgrade financial documents to standard');
-- Even a non-owner given 'roles.manage' cannot change who may open a type.
insert into public.role_permissions (role, permission) values ('admin', 'roles.manage');
select pg_temp.act_as(:student);
select pg_temp.check(pg_temp.fails($$update public.document_types set sensitivity = 'standard' where key = 'financial_statement'$$), 'only the owner can change a document type''s sensitivity');
reset role;
delete from public.role_permissions where role = 'admin' and permission = 'roles.manage';
select pg_temp.act_as(:owner);
select pg_temp.check(pg_temp.affected($$update public.document_types set label = 'Bank statement' where key = 'financial_statement'$$) = 1, 'the owner can edit document types');

reset role;
update public.student_cases set status = 'closed' where id = :caseA;
select pg_temp.check((select closed_at is not null from public.student_cases where id = :caseA), 'closing a case records when');
set role service_role;
select pg_temp.check((select count(*) from public.documents_due_for_deletion()) = 0, 'files are kept for 12 months after a case closes');
reset role;
-- Moving the retention clock needs the database owner (no app role can).
alter table public.student_cases disable trigger student_cases_closed_at;
update public.student_cases set closed_at = now() - interval '13 months' where id = :caseA;
alter table public.student_cases enable trigger student_cases_closed_at;
set role service_role;
select pg_temp.check((select count(*) from public.documents_due_for_deletion()) = 5, 'after 12 months every file of the closed case is due for deletion, including abandoned attempts');
select public.mark_document_version_deleted(version_id) from public.documents_due_for_deletion();
select pg_temp.act_as(:studentA);
select pg_temp.check(pg_temp.fails($$select public.authorize_document_download((select version_id from up2), 'download')$$), 'a deleted file can no longer be opened');
reset role;

-- Permission helpers are for signed-in users only ───────────────────────────
select pg_temp.act_as(null);
select pg_temp.check(pg_temp.refused($$select public.has_permission('leads.read')$$), 'signed-out visitors cannot call has_permission()');
select pg_temp.check(pg_temp.refused($$select public.current_team_role()$$), 'signed-out visitors cannot call current_team_role()');
reset role;

-- Shared rate limits ─────────────────────────────────────────────────────────
select pg_temp.act_as(null);
select pg_temp.check(pg_temp.refused($$select * from public.rate_limit_hit('x', 1, 60)$$), 'signed-out visitors cannot touch rate limits');
select pg_temp.act_as(:student);
select pg_temp.check(pg_temp.refused($$select * from public.rate_limits$$), 'signed-in users cannot read rate limits');
reset role;
set role service_role;
select pg_temp.check((select allowed from public.rate_limit_hit('test:a', 2, 60)), 'the first attempt is allowed');
select pg_temp.check((select allowed from public.rate_limit_hit('test:a', 2, 60)), 'attempts up to the limit are allowed');
select pg_temp.check(not (select allowed from public.rate_limit_hit('test:a', 2, 60)), 'the attempt over the limit is refused');
select pg_temp.check((select retry_after_seconds between 1 and 60 from public.rate_limit_hit('test:a', 2, 60)), 'a refusal says when to retry');
select pg_temp.check((select allowed from public.rate_limit_hit('test:b', 2, 60)), 'other clients have their own allowance');
reset role;
update public.rate_limits set reset_at = now() - interval '1 second' where key = 'test:a';
set role service_role;
select pg_temp.check((select allowed from public.rate_limit_hit('test:a', 2, 60)), 'a new window starts after the old one ends');
reset role;

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
