-- Consultation calls booked through Cal.com (which adds the Google Meet link and
-- the calendar invite). Rows are written only by the Cal.com webhook on the
-- server, using the service role after the webhook signature is verified;
-- staff with 'leads.read' can see them. Additive only.
--
-- Rollback: drop table public.bookings;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  cal_uid text not null unique check (char_length(cal_uid) <= 120),
  status text not null default 'booked' check (status in ('booked', 'rescheduled', 'cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  attendee_name text not null check (char_length(attendee_name) <= 120),
  attendee_email extensions.citext not null check (char_length(attendee_email) <= 254),
  attendee_phone text check (char_length(attendee_phone) <= 32),
  meeting_url text check (char_length(meeting_url) <= 500 and meeting_url ~ '^https://'),
  reference text check (char_length(reference) <= 40),
  lead_id uuid references public.leads (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bookings_starts_at_idx on public.bookings (starts_at);
create index bookings_lead_idx on public.bookings (lead_id);

alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated;
grant select on public.bookings to authenticated;

create policy "Lead staff read bookings" on public.bookings
  for select to authenticated using ((select public.has_permission('leads.read')));

create trigger bookings_updated_at before update on public.bookings for each row execute function public.set_updated_at();
create trigger bookings_audit after insert or update or delete on public.bookings
  for each row execute function public.audit_row_change('personal', 'id');
