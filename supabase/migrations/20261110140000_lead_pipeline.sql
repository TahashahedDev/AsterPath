-- The CRM saves stage changes. The pipeline gains the business stages between
-- qualification and conversion (proposal, agreement, payment) and records why a
-- lead was lost. Additive only: no existing value or row changes.
-- Row Level Security already limits updates to staff with 'leads.write', and the
-- audit trigger on public.leads records every change.
--
-- Rollback: drop column lost_reason. Postgres can't drop enum values; unused
-- values are harmless.

alter type public.lead_status add value if not exists 'proposal' after 'qualified';
alter type public.lead_status add value if not exists 'agreement' after 'proposal';
alter type public.lead_status add value if not exists 'payment' after 'agreement';

alter table public.leads
  add column lost_reason text check (char_length(lost_reason) <= 120);
