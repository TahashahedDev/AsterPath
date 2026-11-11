-- Shared rate limits. Vercel runs many instances of the site, so counters held
-- in each instance's memory let a client spread attempts across instances.
-- These counters live in one table that every instance updates atomically.
--   rate_limits                one row per (limiter, client) window; the client
--                              part is an HMAC, never a raw IP address or email
--   rate_limit_hit(...)        counts one attempt and says whether it is allowed
--   prune_rate_limits()        removes windows that ended a day ago (daily cron)
-- Server only: no grants to anon or authenticated, RLS on with no policies.
-- Additive only.
--
-- Rollback: drop function public.rate_limit_hit(text, integer, integer), public.prune_rate_limits(); drop table public.rate_limits;

create table public.rate_limits (
  key text primary key check (char_length(key) <= 128),
  count integer not null check (count > 0),
  reset_at timestamptz not null
);
create index rate_limits_reset_at_idx on public.rate_limits (reset_at);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- One statement, so concurrent attempts from different instances can't both
-- read the old count: the row lock makes the increments serial.
create function public.rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns table (allowed boolean, retry_after_seconds integer)
language sql
volatile
security definer
set search_path = ''
as $$
  insert into public.rate_limits as rl (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update set
    count = case when rl.reset_at <= now() then 1 else rl.count + 1 end,
    reset_at = case when rl.reset_at <= now() then now() + make_interval(secs => p_window_seconds) else rl.reset_at end
  returning rl.count <= p_limit, greatest(0, ceil(extract(epoch from rl.reset_at - now())))::integer
$$;

create function public.prune_rate_limits() returns integer
language sql
security definer
set search_path = ''
as $$
  with gone as (delete from public.rate_limits where reset_at < now() - interval '1 day' returning 1)
  select count(*)::integer from gone
$$;

revoke execute on function public.rate_limit_hit(text, integer, integer), public.prune_rate_limits() from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer), public.prune_rate_limits() to service_role;
