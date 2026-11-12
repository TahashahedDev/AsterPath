-- Secure student document vault.
--   document_types      configurable categories with a sensitivity class
--   document_requests   what a student has been asked for, and its review status
--   document_versions   each uploaded file (private Storage object), never overwritten
--   document_reviews    the review history students and staff see
--   document_access_log every signed upload or download link issued
--   storage bucket      'student-documents': private, 10 MB, PDF/JPEG/PNG only
--
-- Access model
--   * Storage has no policies for anon or authenticated: browsers never touch the
--     bucket directly. The server issues short-lived signed URLs, and only after
--     the database functions below have authorised the caller and chosen the path.
--   * Status changes happen only through functions that enforce the state machine;
--     no role is granted UPDATE on document_requests.status.
--   * Financial documents open only for 'documents.financial' (owner, admin,
--     finance). Advisors and reviewers still see that they exist and their status.
--   * Files of closed cases are deleted 12 months after closing.
-- Additive only.
--
-- Rollback (drops every document record; the Storage objects must be removed first):
--   drop table public.document_access_log, public.document_reviews, public.document_versions, public.document_requests, public.document_types;
--   drop function public.can_open_document_type(text), public.my_case_ids(), public.document_review_action(uuid, text, text, uuid),
--     public.begin_document_upload(uuid, text), public.complete_document_upload(uuid, text, integer, text),
--     public.reject_document_file(uuid), public.authorize_document_download(uuid, text),
--     public.expire_documents(), public.stale_document_uploads(integer), public.mark_upload_cleaned(uuid),
--     public.documents_due_for_deletion(integer), public.mark_document_version_deleted(uuid),
--     public.set_case_closed_at(), public.guard_document_type_sensitivity(), public.check_document_request_application();
--   alter table public.student_cases drop column closed_at;
--   grant update on public.student_cases to authenticated;
--   delete from storage.buckets where id = 'student-documents';
--   delete from public.role_permissions where permission in ('documents.request', 'documents.review', 'documents.financial');
--   delete from public.permissions where key in ('documents.request', 'documents.review', 'documents.financial');

-- ── Permissions ─────────────────────────────────────────────────────────────

insert into public.permissions (key, description) values
  ('documents.request', 'Ask a student for a document, and withdraw a request'),
  ('documents.review', 'Approve, reject or ask for a replacement of a student document'),
  ('documents.financial', 'Open financial documents (bank statements, sponsor letters)');

insert into public.role_permissions (role, permission) values
  ('owner', 'documents.request'), ('owner', 'documents.review'), ('owner', 'documents.financial'),
  ('admin', 'documents.request'), ('admin', 'documents.review'), ('admin', 'documents.financial'),
  ('advisor', 'documents.request'), ('advisor', 'documents.review'),
  ('document_reviewer', 'documents.review'),
  ('finance', 'documents.financial');

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.document_types (
  key text primary key check (key ~ '^[a-z0-9_]{2,40}$'),
  label text not null check (char_length(label) between 2 and 80),
  sensitivity text not null default 'standard' check (sensitivity in ('standard', 'identity', 'financial')),
  sort smallint not null default 100,
  active boolean not null default true
);

insert into public.document_types (key, label, sensitivity, sort) values
  ('passport', 'Passport', 'identity', 10),
  ('transcripts', 'Academic transcripts', 'standard', 20),
  ('class_10', 'Class 10 certificate', 'standard', 21),
  ('class_12', 'Class 12 certificate', 'standard', 22),
  ('bachelors_degree', 'Bachelor''s degree', 'standard', 23),
  ('masters_degree', 'Master''s degree', 'standard', 24),
  ('cv', 'CV', 'standard', 30),
  ('language_certificate', 'IELTS or language certificate', 'standard', 31),
  ('sop', 'Statement of Purpose', 'standard', 32),
  ('recommendation_letter', 'Letter of recommendation', 'standard', 33),
  ('financial_statement', 'Financial statement', 'financial', 40),
  ('sponsor_document', 'Sponsor document', 'financial', 41),
  ('admission_letter', 'Admission letter', 'standard', 50),
  ('enrolment_certificate', 'Enrolment certificate', 'standard', 51),
  ('pre_enrolment_summary', 'Pre-enrolment summary', 'standard', 52),
  ('universitaly', 'Universitaly document', 'standard', 53),
  ('visa_form', 'Visa form', 'identity', 60),
  ('insurance', 'Insurance', 'standard', 61),
  ('accommodation', 'Accommodation', 'standard', 62),
  ('translation', 'Translation certificate', 'standard', 70),
  ('apostille', 'Apostille', 'standard', 71),
  ('legalisation', 'Legalisation record', 'standard', 72),
  ('other', 'Other', 'standard', 99);

create table public.document_requests (
  id uuid primary key default gen_random_uuid(),
  -- restrict: a case with documents can't be deleted until its Storage objects are removed.
  case_id uuid not null references public.student_cases (id) on delete restrict,
  application_id uuid references public.case_applications (id) on delete set null,
  type_key text not null references public.document_types (key),
  title text not null check (char_length(title) between 2 and 120),
  instructions text not null default '' check (char_length(instructions) <= 1000),
  status text not null default 'requested'
    check (status in ('requested', 'uploaded', 'under_review', 'approved', 'rejected', 'reupload_required', 'expired', 'withdrawn')),
  due_on date,
  expires_on date,
  current_version integer,
  requested_by uuid default auth.uid() references auth.users (id) on delete set null,
  reviewer_id uuid references public.team_members (user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index document_requests_case_idx on public.document_requests (case_id);
create index document_requests_status_idx on public.document_requests (status, updated_at);
create index document_requests_type_idx on public.document_requests (type_key);
create index document_requests_application_idx on public.document_requests (application_id) where application_id is not null;
create index document_requests_requested_by_idx on public.document_requests (requested_by);
create index document_requests_reviewer_idx on public.document_requests (reviewer_id) where reviewer_id is not null;

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.document_requests (id) on delete restrict,
  case_id uuid not null references public.student_cases (id) on delete restrict,
  version integer not null check (version > 0),
  -- Paths are chosen here, never by the browser, and contain no file name.
  -- upload_path: quarantine/<case>/<request>/<version>, the only path a signed upload URL is ever issued for.
  -- storage_path: <case>/<request>/<version>, written only by the server after it has checked the bytes, so
  -- nothing the browser holds can overwrite a verified file.
  upload_path text not null unique check (upload_path ~ '^quarantine/[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}$'),
  storage_path text not null unique check (storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}$'),
  original_filename text not null check (char_length(original_filename) between 1 and 200),
  mime_type text check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  size_bytes integer check (size_bytes between 1 and 10485760),
  sha256 text check (sha256 ~ '^[0-9a-f]{64}$'),
  state text not null default 'pending' check (state in ('pending', 'active', 'superseded', 'rejected_file', 'abandoned', 'deleted')),
  -- No scanning provider is connected yet: every file stays 'not_scanned' until one is.
  scan_status text not null default 'not_scanned' check (scan_status in ('not_scanned', 'clean', 'infected', 'failed')),
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  uploaded_at timestamptz,
  deleted_at timestamptz,
  -- When the quarantine object was removed (after its signed upload URL can no longer be used).
  upload_cleaned_at timestamptz,
  unique (request_id, version),
  check (state <> 'active' or (mime_type is not null and size_bytes is not null and sha256 is not null and uploaded_at is not null))
);
create index document_versions_case_idx on public.document_versions (case_id);
create index document_versions_uploaded_by_idx on public.document_versions (uploaded_by);

create table public.document_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.document_requests (id) on delete cascade,
  version_id uuid references public.document_versions (id) on delete set null,
  action text not null check (action in ('requested', 'uploaded', 'opened', 'approved', 'rejected', 'reupload_required', 'withdrawn', 'expired', 'file_refused')),
  note text not null default '' check (char_length(note) <= 1000),
  actor_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index document_reviews_request_idx on public.document_reviews (request_id, created_at);
create index document_reviews_version_idx on public.document_reviews (version_id);
create index document_reviews_actor_idx on public.document_reviews (actor_id);

create table public.document_access_log (
  id bigint generated always as identity primary key,
  version_id uuid references public.document_versions (id) on delete set null,
  actor_id uuid references auth.users (id) on delete set null,
  purpose text not null check (purpose in ('upload', 'download', 'preview')),
  at timestamptz not null default now()
);
create index document_access_log_version_idx on public.document_access_log (version_id, at desc);
create index document_access_log_actor_idx on public.document_access_log (actor_id, at desc);

-- Retention starts when a case closes.
alter table public.student_cases add column closed_at timestamptz;

-- closed_at drives deletion of a student's files, so only this trigger sets it:
-- on every update, whatever the caller sent.
create function public.set_case_closed_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'closed' and old.status is distinct from 'closed' then
    new.closed_at := now();
  elsif new.status <> 'closed' then
    new.closed_at := null;
  else
    new.closed_at := old.closed_at;
  end if;
  return new;
end;
$$;
create trigger student_cases_closed_at before update on public.student_cases
  for each row execute function public.set_case_closed_at();

-- Case staff may move a case and assign its advisor, but not change which account
-- or email it belongs to (that would hand another person the student's documents).
revoke update on public.student_cases from authenticated;
grant update (stage, status, advisor_id) on public.student_cases to authenticated;

-- A type's sensitivity decides who can open its files; only the owner may change it.
create function public.guard_document_type_sensitivity() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.sensitivity is distinct from old.sensitivity and public.current_team_role() is distinct from 'owner' then
    raise exception 'only the owner can change who may open a document type' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger document_types_sensitivity before update on public.document_types
  for each row execute function public.guard_document_type_sensitivity();

-- A request linked to an application must be for the same case.
create function public.check_document_request_application() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.application_id is not null and not exists (
    select 1 from public.case_applications a where a.id = new.application_id and a.case_id = new.case_id
  ) then
    raise exception 'the application belongs to another case' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger document_requests_application before insert or update on public.document_requests
  for each row execute function public.check_document_request_application();

-- ── Private Storage bucket ──────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-documents', 'student-documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- ── Access helpers ──────────────────────────────────────────────────────────

-- Whether the signed-in staff member may open files of this type.
create function public.can_open_document_type(p_type text) returns boolean
language sql stable security definer set search_path = '' as $$
  select case t.sensitivity
           when 'financial' then public.has_permission('documents.financial')
           else public.has_permission('documents.read')
         end
  from public.document_types t
  where t.key = p_type
$$;

-- The signed-in student's own case ids.
create function public.my_case_ids() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select sc.id from public.student_cases sc where sc.student_user_id = (select auth.uid())
$$;

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table public.document_types enable row level security;
alter table public.document_requests enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_reviews enable row level security;
alter table public.document_access_log enable row level security;

revoke all on public.document_types, public.document_requests, public.document_versions, public.document_reviews, public.document_access_log from anon, authenticated;
grant select on public.document_types, public.document_requests, public.document_versions, public.document_reviews, public.document_access_log to authenticated;
grant insert, update on public.document_types to authenticated;
-- Staff create requests and edit their wording and dates; status is never granted.
grant insert (case_id, application_id, type_key, title, instructions, due_on, expires_on, requested_by) on public.document_requests to authenticated;
grant update (title, instructions, due_on, expires_on) on public.document_requests to authenticated;

create policy "Signed-in users read document types" on public.document_types
  for select to authenticated using (true);
create policy "Role managers add document types" on public.document_types
  for insert to authenticated with check ((select public.has_permission('roles.manage')));
create policy "Role managers edit document types" on public.document_types
  for update to authenticated using ((select public.has_permission('roles.manage'))) with check ((select public.has_permission('roles.manage')));

-- Staff with any document permission see that a request exists and its status;
-- students see their own.
create policy "Staff and the student read document requests" on public.document_requests
  for select to authenticated using (
    (select public.has_permission('documents.read'))
    or ((select public.has_permission('documents.financial')) and exists (
      select 1 from public.document_types t where t.key = type_key and t.sensitivity = 'financial'
    ))
    or case_id in (select public.my_case_ids())
  );
create policy "Document staff create requests" on public.document_requests
  for insert to authenticated with check ((select public.has_permission('documents.request')) and requested_by = (select auth.uid()));
create policy "Document staff edit requests" on public.document_requests
  for update to authenticated
  using ((select public.has_permission('documents.request')))
  with check ((select public.has_permission('documents.request')));

-- File records only where the viewer may open that type of file.
create policy "Permitted staff and the student read file versions" on public.document_versions
  for select to authenticated using (
    case_id in (select public.my_case_ids())
    or exists (select 1 from public.document_requests r where r.id = request_id and public.can_open_document_type(r.type_key))
  );

-- Students see outcomes and feedback on their own documents, not internal events.
create policy "Staff and the student read review history" on public.document_reviews
  for select to authenticated using (
    exists (select 1 from public.document_requests r where r.id = request_id and public.can_open_document_type(r.type_key))
    or (
      action in ('requested', 'uploaded', 'approved', 'rejected', 'reupload_required', 'withdrawn', 'expired', 'file_refused')
      and exists (select 1 from public.document_requests r where r.id = request_id and r.case_id in (select public.my_case_ids()))
    )
  );

create policy "Auditors read document access" on public.document_access_log
  for select to authenticated using ((select public.has_permission('audit.read')));

-- ── State machine ───────────────────────────────────────────────────────────
-- Every function checks the caller's rights with a plain read before locking a
-- row, and answers "not allowed" (42501) both for rows that don't exist and for
-- rows the caller may not touch, so ids can't be probed.

-- Staff decisions: approve, reject, ask for a replacement, withdraw. A decision
-- on a file names the version the reviewer opened, so a file swapped since then
-- can't be approved unseen.
create function public.document_review_action(p_request uuid, p_action text, p_note text default '', p_version uuid default null)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  r public.document_requests;
  active_version uuid;
  next_status text;
begin
  if p_action not in ('approved', 'rejected', 'reupload_required', 'withdrawn') then
    raise exception 'unknown decision' using errcode = '22023';
  end if;
  select * into r from public.document_requests where id = p_request;
  if not found
     or (p_action = 'withdrawn' and not public.has_permission('documents.request'))
     or (p_action <> 'withdrawn' and not (public.has_permission('documents.review') and public.can_open_document_type(r.type_key))) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select * into r from public.document_requests where id = p_request for update;
  select v.id into active_version from public.document_versions v where v.request_id = p_request and v.state = 'active';

  if p_action = 'withdrawn' then
    if r.status = 'withdrawn' then raise exception 'already withdrawn' using errcode = '22023'; end if;
    next_status := 'withdrawn';
  else
    next_status := case
      when p_action in ('approved', 'rejected') and r.status = 'under_review' then p_action
      when p_action = 'reupload_required' and r.status in ('under_review', 'rejected', 'approved', 'expired') then p_action
    end;
    if next_status is null then
      raise exception 'cannot % a document that is %', p_action, r.status using errcode = '22023';
    end if;
    if p_action in ('approved', 'rejected') and (p_version is null or p_version is distinct from active_version) then
      raise exception 'the file has changed since you opened it; open it again' using errcode = '22023';
    end if;
    if p_action in ('rejected', 'reupload_required') and char_length(trim(coalesce(p_note, ''))) < 3 then
      raise exception 'explain what is wrong so the student can fix it' using errcode = '22023';
    end if;
  end if;

  update public.document_requests set status = next_status, reviewer_id = (select auth.uid()) where id = p_request;
  insert into public.document_reviews (request_id, version_id, action, note, actor_id)
  values (p_request, active_version, p_action, left(trim(coalesce(p_note, '')), 1000), (select auth.uid()));
  return next_status;
end;
$$;

-- Called as the uploader: the student, or staff who may open this type of file.
-- Creates the version record and returns the quarantine path the server signs.
create function public.begin_document_upload(p_request uuid, p_filename text)
returns table (version_id uuid, upload_path text)
language plpgsql security definer set search_path = '' as $$
declare
  r public.document_requests;
  new_id uuid := gen_random_uuid();
  final_path text;
begin
  select * into r from public.document_requests where id = p_request;
  if not found or not (
    r.case_id in (select public.my_case_ids())
    or (public.has_permission('documents.request') and public.can_open_document_type(r.type_key))
  ) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select * into r from public.document_requests where id = p_request for update;
  -- A rejected document needs staff to ask for a replacement first (rejected → reupload_required).
  if r.status not in ('requested', 'reupload_required', 'expired') then
    raise exception 'this document is % and does not need a new file', r.status using errcode = '22023';
  end if;
  -- Storage limits: 10 attempts per document and 30 per case per day (each up to 10 MB).
  if (select count(*) from public.document_versions v where v.request_id = r.id and v.created_at > now() - interval '1 day') >= 10
     or (select count(*) from public.document_versions v where v.case_id = r.case_id and v.created_at > now() - interval '1 day') >= 30 then
    raise exception 'too many uploads today' using errcode = '54000';
  end if;

  -- Only the newest attempt can complete.
  update public.document_versions set state = 'abandoned' where request_id = r.id and state = 'pending';

  final_path := r.case_id::text || '/' || r.id::text || '/' || new_id::text;
  insert into public.document_versions (id, request_id, case_id, version, upload_path, storage_path, original_filename, uploaded_by)
  values (
    new_id, r.id, r.case_id,
    coalesce((select max(v.version) from public.document_versions v where v.request_id = r.id), 0) + 1,
    'quarantine/' || final_path,
    final_path,
    left(coalesce(nullif(regexp_replace(trim(p_filename), '[^[:alnum:] ._()-]', '_', 'g'), ''), 'document'), 200),
    (select auth.uid())
  );
  insert into public.document_access_log (version_id, actor_id, purpose) values (new_id, (select auth.uid()), 'upload');
  return query select new_id, 'quarantine/' || final_path;
end;
$$;

-- Server only (service role): the server has read the quarantined bytes, checked
-- them, and written them itself to storage_path. Accepted only for the newest
-- attempt, within two hours, while the document is still waiting for a file.
create function public.complete_document_upload(p_version uuid, p_mime text, p_size integer, p_sha256 text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v public.document_versions;
  r public.document_requests;
begin
  select * into v from public.document_versions where id = p_version;
  if not found then raise exception 'no pending upload' using errcode = 'P0002'; end if;
  select * into r from public.document_requests where id = v.request_id for update;
  select * into v from public.document_versions where id = p_version for update;
  if v.state <> 'pending' or v.created_at < now() - interval '2 hours' then
    raise exception 'this upload has expired; start again' using errcode = '22023';
  end if;
  if v.version <> (select max(x.version) from public.document_versions x where x.request_id = v.request_id) then
    raise exception 'a newer upload replaced this one' using errcode = '22023';
  end if;
  if r.status not in ('requested', 'reupload_required', 'expired') then
    raise exception 'this document no longer needs a file' using errcode = '22023';
  end if;

  update public.document_versions set state = 'superseded' where request_id = v.request_id and state = 'active';
  update public.document_versions
     set state = 'active', mime_type = p_mime, size_bytes = p_size, sha256 = p_sha256, uploaded_at = now()
   where id = p_version;
  update public.document_requests set status = 'uploaded', current_version = v.version where id = v.request_id;
  insert into public.document_reviews (request_id, version_id, action, actor_id) values (v.request_id, v.id, 'uploaded', v.uploaded_by);
end;
$$;

-- Server only: the quarantined file failed the checks (and has been deleted).
create function public.reject_document_file(p_version uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v public.document_versions;
begin
  select * into v from public.document_versions where id = p_version for update;
  if not found or v.state <> 'pending' then raise exception 'no pending upload' using errcode = 'P0002'; end if;
  update public.document_versions set state = 'rejected_file', deleted_at = now() where id = p_version;
  insert into public.document_reviews (request_id, version_id, action, note, actor_id)
  values (v.request_id, v.id, 'file_refused', 'The file was not a valid PDF, JPEG or PNG under 10 MB.', v.uploaded_by);
end;
$$;

-- Called as the viewer before the server signs a download link. Staff opening a
-- newly uploaded file moves it to 'under_review'. Returns the verified path and
-- a download name built here (never taken from the browser).
create function public.authorize_document_download(p_version uuid, p_purpose text default 'download')
returns table (storage_path text, download_name text)
language plpgsql security definer set search_path = '' as $$
declare
  v public.document_versions;
  r public.document_requests;
  is_student boolean;
begin
  if p_purpose not in ('download', 'preview') then raise exception 'unknown purpose' using errcode = '22023'; end if;
  select * into v from public.document_versions where id = p_version;
  if found then select * into r from public.document_requests where id = v.request_id; end if;
  is_student := found and v.case_id in (select public.my_case_ids());
  if v.id is null or v.state not in ('active', 'superseded') or not (is_student or public.can_open_document_type(r.type_key)) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  if not is_student and r.status = 'uploaded' and v.state = 'active' and public.has_permission('documents.review') then
    perform 1 from public.document_requests where id = r.id for update;
    update public.document_requests set status = 'under_review', reviewer_id = (select auth.uid()) where id = r.id and status = 'uploaded';
    insert into public.document_reviews (request_id, version_id, action, actor_id) values (r.id, v.id, 'opened', (select auth.uid()));
  end if;
  insert into public.document_access_log (version_id, actor_id, purpose) values (v.id, (select auth.uid()), p_purpose);
  return query select v.storage_path,
    left(regexp_replace(v.original_filename, '\.[^.]*$', ''), 180)
      || case v.mime_type when 'application/pdf' then '.pdf' when 'image/jpeg' then '.jpg' else '.png' end;
end;
$$;

-- Daily cron (service role): approved documents past their expiry date.
create function public.expire_documents() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  n integer;
begin
  with expired as (
    update public.document_requests set status = 'expired'
     where status = 'approved' and expires_on is not null and expires_on < current_date
    returning id
  ), logged as (
    insert into public.document_reviews (request_id, action, note) select id, 'expired', 'Past its expiry date.' from expired returning 1
  )
  select count(*) into n from logged;
  return n;
end;
$$;

-- Daily cron (service role): upload attempts whose signed URL has expired (2 hours).
-- The server removes the quarantine object and, for attempts never completed, any
-- final object, then calls mark_upload_cleaned.
create function public.stale_document_uploads(p_limit integer default 500)
returns table (version_id uuid, upload_path text, storage_path text, state text)
language sql stable security definer set search_path = '' as $$
  select v.id, v.upload_path, v.storage_path, v.state
  from public.document_versions v
  where v.upload_cleaned_at is null and v.created_at < now() - interval '3 hours'
  order by v.created_at
  limit greatest(1, least(p_limit, 1000))
$$;

create function public.mark_upload_cleaned(p_version uuid) returns void
language sql security definer set search_path = '' as $$
  update public.document_versions
     set upload_cleaned_at = now(),
         state = case when state = 'pending' then 'abandoned' else state end
   where id = p_version
$$;

-- Daily cron (service role): files of cases closed more than 12 months ago.
create function public.documents_due_for_deletion(p_limit integer default 200)
returns table (version_id uuid, storage_path text, upload_path text)
language sql stable security definer set search_path = '' as $$
  select v.id, v.storage_path, v.upload_path
  from public.document_versions v
  join public.student_cases sc on sc.id = v.case_id
  where sc.status = 'closed' and sc.closed_at < now() - interval '12 months'
    and v.state <> 'deleted'
  order by sc.closed_at
  limit greatest(1, least(p_limit, 1000))
$$;

-- Server only, after the Storage objects have been removed.
create function public.mark_document_version_deleted(p_version uuid) returns void
language sql security definer set search_path = '' as $$
  update public.document_versions set state = 'deleted', deleted_at = now(), upload_cleaned_at = coalesce(upload_cleaned_at, now())
   where id = p_version and state <> 'deleted'
$$;

revoke execute on function
  public.can_open_document_type(text), public.my_case_ids(), public.document_review_action(uuid, text, text, uuid),
  public.begin_document_upload(uuid, text), public.complete_document_upload(uuid, text, integer, text),
  public.reject_document_file(uuid), public.authorize_document_download(uuid, text),
  public.expire_documents(), public.stale_document_uploads(integer), public.mark_upload_cleaned(uuid),
  public.documents_due_for_deletion(integer), public.mark_document_version_deleted(uuid),
  public.set_case_closed_at(), public.guard_document_type_sensitivity(), public.check_document_request_application()
from public, anon, authenticated;
grant execute on function
  public.can_open_document_type(text), public.my_case_ids(), public.document_review_action(uuid, text, text, uuid),
  public.begin_document_upload(uuid, text), public.authorize_document_download(uuid, text)
to authenticated;
grant execute on function
  public.complete_document_upload(uuid, text, integer, text), public.reject_document_file(uuid),
  public.expire_documents(), public.stale_document_uploads(integer), public.mark_upload_cleaned(uuid),
  public.documents_due_for_deletion(integer), public.mark_document_version_deleted(uuid)
to service_role;

-- ── Triggers ────────────────────────────────────────────────────────────────

create trigger document_requests_updated_at before update on public.document_requests for each row execute function public.set_updated_at();
create trigger document_requests_audit after insert or update or delete on public.document_requests
  for each row execute function public.audit_row_change('personal', 'id');
create trigger document_versions_audit after insert or update or delete on public.document_versions
  for each row execute function public.audit_row_change('personal', 'id');
create trigger document_reviews_audit after insert or update or delete on public.document_reviews
  for each row execute function public.audit_row_change('personal', 'id');
create trigger document_types_audit after insert or update or delete on public.document_types
  for each row execute function public.audit_row_change('plain', 'key');
