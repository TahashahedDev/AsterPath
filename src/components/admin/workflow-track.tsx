import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** The case journey as an ordered list; wraps on phones instead of scrolling. */
export function WorkflowTrack({ stages, current }: { stages: { value: string; label: string }[]; current: string }) {
  const index = stages.findIndex((s) => s.value === current);
  return (
    <ol className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9" aria-label="Case workflow">
      {stages.map((s, i) => {
        const state = i < index ? "done" : i === index ? "current" : "next";
        return (
          <li
            key={s.value}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ring-1 ring-inset",
              state === "done" && "bg-primary-soft text-primary-deep ring-primary/15",
              state === "current" && "bg-primary font-semibold text-on-primary ring-primary",
              state === "next" && "text-muted ring-border",
            )}
          >
            <span className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] tabular-nums", state === "current" ? "bg-on-primary/20" : "bg-card ring-1 ring-border")}>
              {state === "done" ? <Check className="size-3" aria-hidden="true" /> : i + 1}
            </span>
            <span className="min-w-0 leading-tight">
              {s.label}
              {state === "done" && <span className="sr-only"> (complete)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
