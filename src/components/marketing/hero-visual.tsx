"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

function GlobeFallback() {
  return (
    <svg viewBox="0 0 400 400" className="size-full" aria-hidden="true">
      <defs>
        <radialGradient id="globe-fallback" cx="35%" cy="30%" r="75%">
          <stop offset="0%" style={{ stopColor: "var(--color-globe-hi)" }} />
          <stop offset="65%" style={{ stopColor: "var(--color-globe-mid)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-globe-lo)" }} />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="182" fill="url(#globe-fallback)" className="stroke-ink/10" />
      {[30, 60].map((offset) => (
        <ellipse key={offset} cx="200" cy="200" rx={Math.sin((offset * Math.PI) / 180) * 182} ry="182" fill="none" className="stroke-ink/5" />
      ))}
      <line x1="200" x2="200" y1="18" y2="382" className="stroke-ink/5" />
      {[-120, -60, 0, 60, 120].map((y) => (
        <line key={y} x1={200 - Math.sqrt(182 ** 2 - y ** 2)} x2={200 + Math.sqrt(182 ** 2 - y ** 2)} y1={200 + y} y2={200 + y} className="stroke-ink/5" />
      ))}
    </svg>
  );
}

const HeroGlobe = dynamic(() => import("./hero-globe"), { ssr: false, loading: () => <GlobeFallback /> });

type Mode = "server" | "static" | "animated" | "skip";

function readMode(): Mode {
  // Respect data-saver connections: keep the lightweight fallback instead of loading map data.
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return "skip";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "static" : "animated";
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function HeroVisual() {
  const mode = useSyncExternalStore<Mode>(subscribe, readMode, () => "server");

  return (
    <div className="relative aspect-square w-full">
      {mode === "server" || mode === "skip" ? <GlobeFallback /> : <HeroGlobe animate={mode === "animated"} />}
    </div>
  );
}
