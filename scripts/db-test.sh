#!/usr/bin/env bash
# Applies the Supabase migrations and seed to a throwaway local PostgreSQL and runs
# the RLS checks. Needs PostgreSQL 15+ binaries (initdb, pg_ctl, psql) on PATH.
# The database lives in a temporary directory, listens only on a private socket,
# and is removed when the script ends.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'pg_ctl -D "$work/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$work"' EXIT

initdb -D "$work/data" -A trust -U postgres >/dev/null
pg_ctl -D "$work/data" -o "-k $work -c listen_addresses=''" -l "$work/log" -w start >/dev/null

run() { psql -h "$work" -U postgres -d postgres -v ON_ERROR_STOP=1 -q "$@"; }

run -f "$root/supabase/tests/local-shim.sql"
for migration in "$root"/supabase/migrations/*.sql; do
  run -f "$migration"
done
run -f "$root/supabase/seed.sql"
run -o /dev/null -f "$root/supabase/tests/rls.test.sql" 2>&1 | sed -E "s/^psql:.*NOTICE: +//"
