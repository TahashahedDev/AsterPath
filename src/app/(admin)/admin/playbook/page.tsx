import type { Metadata } from "next";
import { Clock3, Flag, UserRound } from "lucide-react";
import { PageHeader, Panel, StatusPill } from "@/components/dashboard/ui";
import { operatingRules, playbook } from "@/content/playbook";

export const metadata: Metadata = { title: "Playbook" };

const phaseTone = { Win: "gold", Onboard: "primary", Deliver: "neutral" } as const;

export default function PlaybookPage() {
  return (
    <>
      <PageHeader
        eyebrow="How we work"
        title={
          <>
            The playbook, <span className="display-italic text-primary">stage by stage.</span>
          </>
        }
        description="From first message to first week abroad: who owns each stage, how fast we move, and what has to be true before a case moves on. Proposed operating model — founder to confirm."
      />

      <Panel title="Rules we never break" className="mt-8">
        <ul className="grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
          {operatingRules.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta" aria-hidden="true" />
              {r}
            </li>
          ))}
        </ul>
      </Panel>

      <ol className="mt-8 grid gap-4">
        {playbook.map((stage, i) => (
          <li key={stage.id} className="grid gap-4 rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)] md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)]">
            <span className="display text-4xl text-terracotta tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-ink">{stage.title}</h2>
                <StatusPill tone={phaseTone[stage.phase]}>{stage.phase}</StatusPill>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                <UserRound className="size-4" aria-hidden="true" /> {stage.owner}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <Clock3 className="size-4" aria-hidden="true" /> {stage.sla}
              </p>
              <ul className="mt-3 grid gap-1.5 text-sm text-ink-soft">
                {stage.actions.map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-ink-soft" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-paper-deep/60 p-4 text-sm">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
                <Flag className="size-3.5" aria-hidden="true" /> Moves on when
              </p>
              <p className="mt-2 leading-relaxed text-ink-soft">{stage.exit}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
