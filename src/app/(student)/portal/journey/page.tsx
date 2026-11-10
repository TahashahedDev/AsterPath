import type { Metadata } from "next";
import { Check } from "lucide-react";
import { DemoNotice, PageHeader, StatusPill } from "@/components/dashboard/ui";
import { stageCopy } from "@/components/portal/journey-copy";
import { LiveJourney, NoCaseYet } from "@/components/portal/live-case";
import { PortalUnavailable } from "@/components/portal/portal-unavailable";
import { getMyCase } from "@/server/services/cases";
import { destinationLabels } from "@/features/operations/types";
import { cn } from "@/lib/utils";
import { getDemoPortal } from "@/server/demo/portal";
import { isPortalDemoEnabled } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "My journey" };

type State = "done" | "current" | "upcoming";
const stateLabel: Record<State, string> = { done: "Done", current: "You are here", upcoming: "Upcoming" };

export default async function JourneyPage() {
  const header = <PageHeader eyebrow="My journey" title="From profile to your first lecture" description="Every stage, in order, with what you do, what we do and who makes the decision." />;
  const live = await getMyCase();
  if (live !== null) return <>{header}{live ? <LiveJourney c={live} /> : <NoCaseYet />}</>;
  if (!isPortalDemoEnabled()) return <>{header}<PortalUnavailable what="journey" /></>;
  const p = getDemoPortal();
  const stages = p.journey.map((stage, i) => ({ stage, n: i + 1, state: (i < p.stageIndex ? "done" : i === p.stageIndex ? "current" : "upcoming") as State }));

  return (
    <div>
      {header}
      <DemoNotice />
      <p className="mt-6 text-sm text-muted">
        Order differs by country; {destinationLabels[p.student.destination]} shown. In Italy you enrol with the university after you arrive, once your visa is granted.
      </p>

      {/* Desktop: a compact horizontal stepper above the detail cards. */}
      <ol aria-label="Journey stages" className="mt-8 hidden gap-2 lg:grid" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        {stages.map(({ stage, n, state }) => (
          <li key={stage} className="flex flex-col items-center text-center" aria-current={state === "current" ? "step" : undefined}>
            <span className={cn("flex size-9 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-inset", dot(state))}>
              {state === "done" ? <Check className="size-4" aria-hidden="true" /> : n}
            </span>
            <span className={cn("mt-2 text-xs leading-tight", state === "current" ? "font-semibold text-ink" : "text-muted")}>{stageCopy[stage].title}</span>
            <span className="sr-only">{stateLabel[state]}</span>
          </li>
        ))}
      </ol>

      {/* Vertical timeline: the main view on phones, detail view on desktop. */}
      <ol className="relative mt-8 space-y-4 before:absolute before:top-4 before:bottom-4 before:left-[1.125rem] before:w-px before:bg-border-strong lg:mt-10">
        {stages.map(({ stage, n, state }) => {
          const c = stageCopy[stage];
          return (
            <li key={stage} className="relative pl-14" aria-current={state === "current" ? "step" : undefined}>
              <span aria-hidden="true" className={cn("absolute top-4 left-0 flex size-9 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-inset", dot(state))}>
                {state === "done" ? <Check className="size-4" /> : n}
              </span>
              <article className={cn("rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-card)]", state === "current" ? "border-primary/40 bg-card ring-1 ring-primary/20" : "border-border bg-card", state === "upcoming" && "opacity-90")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="display text-xl text-ink">
                    <span className="sr-only">Stage {n}: </span>
                    {c.title}
                  </h2>
                  <StatusPill tone={state === "done" ? "success" : state === "current" ? "gold" : "neutral"}>{stateLabel[state]}</StatusPill>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <Item term="You do" value={c.you} />
                  <Item term="AsterPath does" value={c.us} />
                  <Item term="Who decides" value={c.decides} />
                </dl>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Item({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-muted uppercase">{term}</dt>
      <dd className="mt-1 leading-relaxed text-ink-soft">{value}</dd>
    </div>
  );
}

function dot(state: State) {
  return state === "done" ? "bg-primary text-on-primary ring-primary" : state === "current" ? "bg-gold-soft text-terracotta-deep ring-gold" : "bg-card text-muted ring-border-strong";
}
