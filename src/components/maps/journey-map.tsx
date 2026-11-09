import type { CSSProperties } from "react";
import { buildJourneyMap } from "@/lib/geo";

const LABELLED_CITIES = new Set(["Milan", "Turin", "Bologna", "Padua", "Florence", "Rome", "Naples", "Bari", "Palermo", "Genoa", "Trieste", "Cagliari"]);

/**
 * Home hero map. Routes draw from India's four Italian missions to Italy, then
 * the camera settles on Italy and its regions — all CSS, no JavaScript. With
 * reduced motion the final Italy view is shown immediately.
 */
export function JourneyMap() {
  const map = buildJourneyMap();
  const { camera } = map;
  const inv = 1 / camera.scale;
  const cameraStyle = { "--zx": `${camera.x}px`, "--zy": `${camera.y}px`, "--zs": camera.scale } as CSSProperties;

  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      className="h-auto w-full rounded-[1.25rem]"
      role="img"
      aria-label="Routes from India's four Italian missions — New Delhi, Mumbai, Bengaluru and Kolkata — to Italy, then a closer view of Italy's regions and university cities."
    >
      <defs>
        {/* Soft vignette so the map dissolves into the card instead of ending at a hard edge. */}
        <radialGradient id="journey-fade" cx="50%" cy="50%" r="62%">
          <stop offset="72%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <mask id="journey-mask" maskContentUnits="userSpaceOnUse">
          <rect width={map.width} height={map.height} fill="url(#journey-fade)" />
        </mask>
      </defs>
      <g mask="url(#journey-mask)">
      <g className="journey-camera" style={cameraStyle}>
        <g className="fill-map-land stroke-map-border">
          {map.countries.map((c) => (
            <path key={c.iso} d={c.d} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <path d={map.india} className="fill-primary-soft stroke-primary" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={map.italy} className="fill-terracotta/25 stroke-terracotta dark:fill-terracotta/55" strokeWidth={1} vectorEffect="non-scaling-stroke" />

        {/* Italy close-up: regions and university cities, sized for the zoomed view. */}
        <g className="journey-italy-detail">
          <g className="fill-none stroke-card">
            {map.regions.map((r) => (
              <path key={r.code} d={r.d} strokeWidth={1} strokeOpacity={0.9} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          {map.cities.map((city, i) => (
            <g key={city.name} className="journey-city" style={{ "--i": i } as CSSProperties}>
              <circle cx={city.x} cy={city.y} r={4.5 * inv} className="fill-card stroke-terracotta-deep" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              <circle cx={city.x} cy={city.y} r={2 * inv} className="fill-terracotta-deep" />
              {LABELLED_CITIES.has(city.name) && (
                <text x={city.x + 7 * inv} y={city.y + 4 * inv} fontSize={12 * inv} className="fill-ink font-sans" fontWeight={600}>
                  {city.name}
                </text>
              )}
            </g>
          ))}
        </g>

        {/* Overview layer: routes, missions and labels fade away as the camera arrives. */}
        <g className="journey-early">
          {map.routes.map((route, i) => (
            <path
              key={route.city}
              d={route.d}
              className="journey-route fill-none stroke-primary"
              strokeWidth={1.6}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ "--len": route.length, "--delay": `${0.3 + i * 0.25}s` } as CSSProperties}
            />
          ))}
          {map.missions.map((m) => (
            <g key={m.city}>
              <circle cx={m.x} cy={m.y} r={5} className="journey-pulse fill-primary/40" />
              <circle cx={m.x} cy={m.y} r={3.6} className="fill-primary stroke-card" strokeWidth={1.5} />
            </g>
          ))}
          <text x={map.labels.india[0]} y={map.labels.india[1]} className="fill-primary-deep font-sans" fontSize={15} fontWeight={700} letterSpacing="0.12em">
            INDIA
          </text>
          <text x={map.labels.italy[0]} y={map.labels.italy[1]} className="fill-terracotta-deep font-sans" fontSize={15} fontWeight={700} letterSpacing="0.12em">
            ITALY
          </text>
        </g>
      </g>
      </g>
    </svg>
  );
}
