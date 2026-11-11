-- Anonymous website analytics: page views, button clicks and the visit → enquiry
-- funnel, for deciding where marketing effort goes. No cookies, no IP address,
-- no user agent, no form contents: a random per-tab id groups one visit.
-- Rows are written only by /api/events with the service role; anyone with
-- 'reports.read' (owner, admin, finance, marketing, analyst) sees aggregates.
-- Events older than 13 months are removed by public.prune_site_events().
-- Additive only.
--
-- Rollback: drop function public.marketing_summary(integer), public.prune_site_events(); drop table public.site_events;

create table public.site_events (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  session_id uuid not null,
  name text not null check (name in ('pageview', 'cta_click', 'whatsapp_click', 'booking_click', 'enquiry_started', 'enquiry_submitted')),
  path text not null check (char_length(path) <= 200),
  label text check (char_length(label) <= 80),
  source text check (char_length(source) <= 80),
  medium text check (char_length(medium) <= 80),
  campaign text check (char_length(campaign) <= 120),
  referrer_host text check (char_length(referrer_host) <= 120),
  device text not null check (device in ('mobile', 'tablet', 'desktop'))
);
create index site_events_at_idx on public.site_events (at);
create index site_events_name_at_idx on public.site_events (name, at);

alter table public.site_events enable row level security;
revoke all on public.site_events from anon, authenticated;
grant select on public.site_events to authenticated;

create policy "Report readers read site events" on public.site_events
  for select to authenticated using ((select public.has_permission('reports.read')));

-- Aggregates for the marketing dashboard. Runs as the caller, so RLS applies.
create function public.marketing_summary(p_days integer default 30) returns jsonb
language sql stable security invoker set search_path = '' as $$
  with e as (
    select *, coalesce(nullif(source, ''), nullif(referrer_host, ''), 'Direct') as channel
    from public.site_events
    where at >= now() - make_interval(days => greatest(1, least(p_days, 400)))
  )
  select jsonb_build_object(
    'visits', (select count(distinct session_id) from e),
    'pageviews', (select count(*) from e where name = 'pageview'),
    'started', (select count(distinct session_id) from e where name = 'enquiry_started'),
    'enquiries', (select count(distinct session_id) from e where name = 'enquiry_submitted'),
    'whatsapp', (select count(distinct session_id) from e where name = 'whatsapp_click'),
    'booking', (select count(distinct session_id) from e where name = 'booking_click'),
    'mobileShare', (select round(100.0 * count(distinct session_id) filter (where device = 'mobile') / nullif(count(distinct session_id), 0)) from e),
    'pages', coalesce((select jsonb_agg(p) from (
        select path, count(*) as views, count(distinct session_id) as visits from e where name = 'pageview'
        group by path order by views desc limit 12) p), '[]'::jsonb),
    'channels', coalesce((select jsonb_agg(c) from (
        select channel, count(distinct session_id) as visits,
               count(distinct session_id) filter (where name = 'enquiry_submitted') as enquiries,
               count(distinct session_id) filter (where name = 'whatsapp_click') as whatsapp
        from e group by channel order by visits desc limit 12) c), '[]'::jsonb),
    'campaigns', coalesce((select jsonb_agg(c) from (
        select campaign, count(distinct session_id) as visits,
               count(distinct session_id) filter (where name = 'enquiry_submitted') as enquiries
        from e where campaign is not null group by campaign order by visits desc limit 10) c), '[]'::jsonb),
    'ctas', coalesce((select jsonb_agg(c) from (
        select label, count(*) as clicks from e where name = 'cta_click' and label is not null
        group by label order by clicks desc limit 10) c), '[]'::jsonb),
    'daily', coalesce((select jsonb_agg(d order by d.day) from (
        select (at at time zone 'Asia/Kolkata')::date as day, count(distinct session_id) as visits,
               count(distinct session_id) filter (where name = 'enquiry_submitted') as enquiries
        from e group by 1) d), '[]'::jsonb)
  )
$$;
revoke execute on function public.marketing_summary(integer) from public, anon;
grant execute on function public.marketing_summary(integer) to authenticated;

-- Retention: call daily (Supabase cron or a Vercel cron) to keep 13 months.
create function public.prune_site_events() returns integer
language sql security definer set search_path = '' as $$
  with gone as (delete from public.site_events where at < now() - interval '13 months' returning 1)
  select count(*)::integer from gone
$$;
revoke execute on function public.prune_site_events() from public, anon, authenticated;
