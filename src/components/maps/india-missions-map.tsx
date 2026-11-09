import { buildIndiaMissionsMap } from "@/lib/geo";
import { italianMissionsInIndia } from "@/content/italy/facts";
import { sources } from "@/content/italy/sources";
import { Badge } from "@/components/ui/badge";

// Label placement around each marker so the four cities never collide.
const labelOffset: Record<string, [number, number, "start" | "end"]> = {
  "New Delhi": [10, -6, "start"],
  Mumbai: [-10, 4, "end"],
  Bengaluru: [10, 4, "start"],
  Kolkata: [10, 4, "start"],
};

/** India with its four Italian missions, alongside who covers which states. */
export function IndiaMissionsMap() {
  const map = buildIndiaMissionsMap();
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <svg viewBox={`0 0 ${map.width} ${map.height}`} className="mx-auto h-auto w-full max-w-md" role="img" aria-label="Map of India marking the Italian missions in New Delhi, Mumbai, Bengaluru and Kolkata.">
        <path d={map.india} className="fill-primary-soft stroke-primary" strokeWidth={1.2} />
        {map.missions.map((m) => {
          const [dx, dy, anchor] = labelOffset[m.city] ?? [10, 4, "start"];
          return (
            <g key={m.city}>
              <circle cx={m.x} cy={m.y} r={9} className="journey-pulse fill-terracotta/35" />
              <circle cx={m.x} cy={m.y} r={5} className="fill-terracotta stroke-card" strokeWidth={2} />
              <text x={m.x + dx} y={m.y + dy} textAnchor={anchor} fontSize={14} fontWeight={700} className="fill-ink font-sans">
                {m.city}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="grid gap-3">
        {italianMissionsInIndia.map((mission) => (
          <li key={mission.city} className="rounded-[var(--radius-card)] border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <a href={sources[mission.sourceId].url} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink hover:text-primary">
                {mission.name}, {mission.city}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              {!mission.confirmed && <Badge tone="warning">Confirm with the mission</Badge>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{mission.jurisdiction}</p>
          </li>
        ))}
        <li className="text-sm leading-relaxed text-muted">
          Your <strong className="font-semibold text-ink">DOV</strong> goes to the mission covering the state where your degree was issued. Your{" "}
          <strong className="font-semibold text-ink">visa</strong> goes to the mission covering where you live. If your state is not listed, we confirm
          the right office with you.
        </li>
      </ul>
    </div>
  );
}
