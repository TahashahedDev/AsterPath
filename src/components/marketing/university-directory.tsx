"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { University, UniversityKind } from "@/content/italy/universities";

type RegionOption = { code: string; slug: string; name: string };

const fieldClass =
  "h-12 w-full rounded-full border border-border-strong bg-card px-4 text-base text-ink transition-shadow sm:text-[0.9375rem] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none";

function normalise(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function UniversityDirectory({
  universities,
  regions,
  kindLabels,
}: {
  universities: University[];
  regions: RegionOption[];
  kindLabels: Record<UniversityKind, string>;
}) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [kind, setKind] = useState<UniversityKind | "">("");
  const deferredQuery = useDeferredValue(query);
  const id = useId();

  const groups = useMemo(() => {
    const q = normalise(deferredQuery);
    const matches = universities.filter(
      (u) => (!region || u.regionCode === region) && (!kind || u.kind === kind) && (!q || normalise(`${u.name} ${u.city}`).includes(q)),
    );
    return regions.map((r) => ({ region: r, list: matches.filter((u) => u.regionCode === r.code) })).filter((g) => g.list.length > 0);
  }, [deferredQuery, region, kind, universities, regions]);

  const count = groups.reduce((n, g) => n + g.list.length, 0);
  const filtered = Boolean(query || region || kind);
  const kinds = Object.keys(kindLabels) as UniversityKind[];

  function reset() {
    setQuery("");
    setRegion("");
    setKind("");
  }

  return (
    <div>
      <form role="search" aria-label="Filter universities" onSubmit={(e) => e.preventDefault()} className="grid gap-3 rounded-[var(--radius-card)] border border-border bg-card/70 p-4 shadow-[var(--shadow-card)] sm:p-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative">
          <label htmlFor={`${id}-q`} className="sr-only">
            Search by university or city
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id={`${id}-q`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by university or city"
            autoComplete="off"
            className={`${fieldClass} pl-11`}
          />
        </div>
        <div>
          <label htmlFor={`${id}-region`} className="sr-only">
            Region
          </label>
          <select id={`${id}-region`} value={region} onChange={(e) => setRegion(e.target.value)} className={fieldClass}>
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-kind`} className="sr-only">
            Type of institution
          </label>
          <select id={`${id}-kind`} value={kind} onChange={(e) => setKind(e.target.value as UniversityKind | "")} className={fieldClass}>
            <option value="">All types</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {kindLabels[k]}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" aria-atomic="true" className="text-sm text-muted">
          {filtered ? (
            <>
              Showing <span className="font-semibold text-ink">{count}</span> of {universities.length} universities
            </>
          ) : (
            <>All {universities.length} universities</>
          )}
        </p>
        {filtered && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
            <X className="size-4" aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-border-strong bg-card/50 p-10 text-center">
          <p className="display text-2xl text-ink">No universities match.</p>
          <p className="mt-2 text-muted">Try another spelling, or the Italian or English name of the city.</p>
          <button type="button" onClick={reset} className="mt-5 text-sm font-semibold text-primary hover:text-primary-deep">
            Show all universities
          </button>
        </div>
      ) : (
        <div className="mt-6">
          {groups.map(({ region: r, list }) => (
            <div key={r.code} id={r.slug} className="cols scroll-mt-28 border-t border-rule py-10">
              <div className="col-span-4">
                <h2 className="text-[length:var(--text-title)]">
                  <Link href={`/regions/${r.slug}`} className="transition-colors duration-200 hover:text-mark">
                    {r.name}
                  </Link>
                </h2>
              </div>
              <ul className="rows col-span-8">
                {list.map((u) => (
                  <li key={u.slug} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_9rem_10rem] sm:items-baseline sm:gap-6">
                    <Link href={`/universities/${u.slug}`} className="-my-2 py-2 text-[1.0625rem] font-medium transition-colors duration-200 hover:text-mark">
                      {u.name}
                    </Link>
                    <span className="text-[0.9375rem] text-ink-2">{u.city}</span>
                    <a href={u.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 text-[0.9375rem] text-muted">
                      Official website <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      <span className="visually-hidden">: {u.name} (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
