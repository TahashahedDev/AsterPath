"use client";

import { useId, useState, type CSSProperties } from "react";
import { ArrowUpRight, Building2, Landmark, MousePointerClick } from "lucide-react";
import type { RegionMapData } from "@/lib/geo";
import type { Region } from "@/content/italy/regions";
import { cn } from "@/lib/utils";

/**
 * Interactive map of Italy's regions. Choosing a region (on the map or from the
 * list) eases the camera onto it and shows its DSU body and main universities.
 * The <select> is the accessible control; the map is a pointer shortcut.
 */
export function RegionExplorer({ map, regions }: { map: RegionMapData; regions: Region[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectId = useId();
  const region = selected ? regions.find((r) => r.code === selected) : undefined;
  const shape = selected ? map.regions.find((r) => r.code === selected) : undefined;

  let transform = "translate(0px, 0px) scale(1)";
  if (shape) {
    const [[x0, y0], [x1, y1]] = shape.bounds;
    const scale = Math.max(1, Math.min(2.2, (map.width * 0.55) / (x1 - x0), (map.height * 0.55) / (y1 - y0)));
    const tx = map.width / 2 - scale * ((x0 + x1) / 2);
    const ty = map.height / 2 - scale * ((y0 + y1) / 2);
    transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-card">
        <svg viewBox={`0 0 ${map.width} ${map.height}`} className="h-auto w-full" aria-hidden="true">
          <g className="region-camera" style={{ transform } as CSSProperties}>
            {map.regions.map((r) => {
              const active = r.code === selected;
              return (
                <path
                  key={r.code}
                  d={r.d}
                  onClick={() => setSelected(active ? null : r.code)}
                  className={cn(
                    "region-shape cursor-pointer stroke-card",
                    active ? "fill-terracotta" : selected ? "fill-map-land opacity-60 hover:opacity-100" : "fill-map-land hover:fill-terracotta/40",
                  )}
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{r.name}</title>
                </path>
              );
            })}
          </g>
        </svg>
        {selected && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute top-3 right-3 rounded-full bg-card/90 px-3 py-1.5 text-sm font-medium text-ink shadow-[var(--shadow-card)] ring-1 ring-border backdrop-blur"
          >
            Show all of Italy
          </button>
        )}
      </div>

      <div className="lg:sticky lg:top-28">
        <label htmlFor={selectId} className="mb-2 block text-sm font-semibold text-ink">
          Choose a region
        </label>
        <select
          id={selectId}
          value={selected ?? ""}
          onChange={(e) => setSelected(e.target.value || null)}
          className="block h-12 w-full appearance-none rounded-xl border border-border-strong bg-card px-4 text-[1rem] text-ink focus:border-primary focus:ring-4 focus:ring-primary/12 focus:outline-none"
        >
          <option value="">All 20 regions</option>
          {regions.map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </select>

        <div aria-live="polite" className="mt-6">
          {region ? (
            <div key={region.code} className="motion-safe:animate-rise">
              <h3 className="display text-3xl text-ink">{region.name}</h3>
              <h4 className="mt-6 flex items-center gap-2 text-sm font-semibold text-ink">
                <Landmark className="size-4 text-terracotta" aria-hidden="true" /> Student support (DSU)
              </h4>
              <ul className="mt-3 space-y-2">
                {region.dsu.map((body) => (
                  <li key={body.name} className="rounded-xl border border-border bg-card px-4 py-3">
                    {body.url ? (
                      <a href={body.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-deep">
                        {body.name} <ArrowUpRight className="size-4" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ) : (
                      <span className="font-semibold text-ink">{body.name}</span>
                    )}
                    {body.note && <p className="mt-1 text-sm text-muted">{body.note}</p>}
                  </li>
                ))}
              </ul>
              <h4 className="mt-6 flex items-center gap-2 text-sm font-semibold text-ink">
                <Building2 className="size-4 text-terracotta" aria-hidden="true" /> Main public universities
              </h4>
              <ul className="mt-3 flex flex-wrap gap-2">
                {region.universities.map((u) => (
                  <li key={u} className="rounded-full bg-paper-deep px-3 py-1.5 text-sm text-ink-soft ring-1 ring-border">
                    {u}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-muted">
                You apply for DSU support to the body that serves the region of your university — not the region you live in.
              </p>
            </div>
          ) : (
            <p className="flex gap-3 rounded-xl border border-dashed border-border-strong p-5 text-[0.9375rem] leading-relaxed text-muted">
              <MousePointerClick className="mt-0.5 size-5 shrink-0 text-terracotta" aria-hidden="true" />
              Select a region on the map or from the list to see which body runs its scholarships and which public universities are there.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
