"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { journeyOwnerLabel, type JourneyStep } from "@/content/journey";
import { cn } from "@/lib/utils";

/** Vertical, keyboard-accessible timeline. Each step expands in place; the rail fills up to the open step. */
export function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const baseId = useId();
  const progress = steps.length > 1 ? openIndex / (steps.length - 1) : 1;

  return (
    <ol className="relative">
      <span className="absolute top-3 bottom-3 left-[1.1875rem] w-px bg-border-strong" aria-hidden="true" />
      <span
        className="absolute top-3 left-[1.1875rem] w-px origin-top bg-primary transition-[height] duration-700 ease-[var(--ease-out-soft)]"
        style={{ height: `calc((100% - 1.5rem) * ${progress})` }}
        aria-hidden="true"
      />
      {steps.map((step, index) => {
        const open = index === openIndex;
        const reached = index <= openIndex;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <li key={step.number} className="relative pl-14">
            <span
              className={cn(
                "absolute top-2.5 left-0 flex size-10 items-center justify-center rounded-full border text-sm font-medium tabular-nums transition-colors duration-500",
                reached ? "border-primary bg-primary text-on-primary" : "border-border-strong bg-card text-muted",
              )}
              aria-hidden="true"
            >
              {String(step.number).padStart(2, "0")}
            </span>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(index)}
                className="flex w-full items-center justify-between gap-4 rounded-lg py-4 text-left"
              >
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="sr-only">Step {step.number}: </span>
                  <span className={cn("text-lg font-medium tracking-tight transition-colors", open ? "text-ink" : "text-ink-soft")}>{step.title}</span>
                  {step.conditional && <span className="text-xs font-medium tracking-wide text-gold-deep uppercase">{step.conditional}</span>}
                </span>
                <ChevronDown className={cn("size-4 shrink-0 text-subtle transition-transform duration-300", open && "rotate-180")} aria-hidden="true" />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-label={step.title}
              className={cn("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-soft)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="overflow-hidden" inert={!open}>
                <div className="pb-6">
                  <p className="max-w-xl leading-relaxed text-muted">{step.description}</p>
                  <p className="mt-3 text-sm">
                    <span className="text-muted">Responsibility: </span>
                    <span className="font-medium text-ink">{journeyOwnerLabel[step.owner]}</span>
                  </p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
