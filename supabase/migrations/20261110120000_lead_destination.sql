-- Enquiries now record the destination (Italy, Germany, France or undecided) and
-- whether the student wants study admission or work-visa guidance.
-- Additive only: existing rows were all Italy study enquiries, which the defaults reflect.
-- Row Level Security, grants and the audit trigger on public.leads are unchanged
-- (the audit log records column names, never values).
--
-- Rollback:
--   alter table public.leads drop column destination, drop column pathway;

alter table public.leads
  add column destination text not null default 'italy'
    check (destination in ('italy', 'germany', 'france', 'undecided')),
  add column pathway text not null default 'study'
    check (pathway in ('study', 'work'));

create index leads_destination_idx on public.leads (destination);
