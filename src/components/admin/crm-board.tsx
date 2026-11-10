"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarClock, ChevronDown, Search } from "lucide-react";
import { degreeLabels, destinationLabels, leadStages, type DegreeLevel, type Destination, type Lead, type LeadStage, type StaffMember } from "@/features/operations/types";
import { Avatar, formatDate } from "@/components/dashboard/ui";
import { daysBetween } from "@/components/admin/format";
import { LeadDrawer, type BoardMode } from "@/components/admin/lead-drawer";
import { updateLeadStage } from "@/app/(admin)/admin/crm/actions";
import { cn } from "@/lib/utils";

type Filters = { q: string; destination: Destination | ""; advisor: string; level: DegreeLevel | "" };

function matches(lead: Lead, f: Filters) {
  if (f.destination && lead.destination !== f.destination) return false;
  if (f.level && lead.level !== f.level) return false;
  if (f.advisor && (f.advisor === "none" ? lead.advisorId !== null : lead.advisorId !== f.advisor)) return false;
  if (!f.q) return true;
  const q = f.q.toLowerCase();
  return [lead.name, lead.reference, lead.email, lead.source, ...lead.tags].some((v) => v.toLowerCase().includes(q));
}

/** The pipeline: one column per stage, filtered on the client. Live mode saves stage changes; demo mode keeps them in memory. */
export function CrmBoard({ initialLeads, staff, mode, today }: { initialLeads: Lead[]; staff: StaffMember[]; mode: BoardMode; today: string }) {
  const [leads, setLeads] = useState(initialLeads);
  const [filters, setFilters] = useState<Filters>({ q: "", destination: "", advisor: "", level: "" });
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = useMemo(() => leads.filter((l) => matches(l, filters)), [leads, filters]);
  const lost = visible.filter((l) => l.stage === "lost");
  const open = leads.find((l) => l.id === openId) ?? null;
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((f) => ({ ...f, [key]: value }));

  const changeStage = (id: string, stage: LeadStage, lostReason?: string) => {
    if (mode === "readonly") return;
    const previous = leads;
    setError(null);
    setLeads((all) => all.map((l) => (l.id === id ? { ...l, stage, lostReason: stage === "lost" ? lostReason : undefined } : l)));
    if (mode !== "live") return;
    startTransition(async () => {
      const result = await updateLeadStage({ id, stage, lostReason });
      if (!result.ok) {
        setLeads(previous);
        setError(result.message);
      }
    });
  };

  const selectCls = "h-10 rounded-lg border border-border-strong bg-paper px-2.5 text-sm text-ink";

  return (
    <div className="mt-6">
      <div role="search" className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-3 shadow-[var(--shadow-card)] md:flex-row md:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-muted">
          Search
          <span className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
            <input type="search" value={filters.q} onChange={(e) => set("q", e.target.value)} placeholder="Name, reference, email, tag" className={cn(selectCls, "w-full pl-9 placeholder:text-subtle")} />
          </span>
        </label>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 md:flex">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted md:w-40">
            Destination
            <select value={filters.destination} onChange={(e) => set("destination", e.target.value as Filters["destination"])} className={selectCls}>
              <option value="">All</option>
              {Object.entries(destinationLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted md:w-44">
            Advisor
            <select value={filters.advisor} onChange={(e) => set("advisor", e.target.value)} className={selectCls}>
              <option value="">All</option>
              <option value="none">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted md:w-36">
            Level
            <select value={filters.level} onChange={(e) => set("level", e.target.value as Filters["level"])} className={selectCls}>
              <option value="">All</option>
              {Object.entries(degreeLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-muted" aria-live="polite">
        Showing {visible.length} of {leads.length} leads. Scroll the board sideways to see every stage.
      </p>

      <div
        role="region"
        aria-label="Pipeline board"
        tabIndex={0}
        className="mt-3 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:mx-0 sm:px-0"
      >
        {leadStages.map((stage) => {
          const items = visible.filter((l) => l.stage === stage.value);
          return (
            <section key={stage.value} aria-labelledby={`col-${stage.value}`} className="flex w-[82vw] max-w-72 shrink-0 snap-start flex-col rounded-[var(--radius-card)] bg-paper-deep/70 p-2 sm:w-72">
              <h2 id={`col-${stage.value}`} className="flex items-center justify-between px-2 pt-1 pb-2 text-xs font-semibold tracking-[0.12em] text-ink-soft uppercase">
                {stage.label}
                <span className="rounded-full bg-card px-2 py-0.5 text-[0.6875rem] text-muted tabular-nums ring-1 ring-border">{items.length}</span>
              </h2>
              <ul className="flex flex-col gap-2">
                {items.map((lead) => (
                  <li key={lead.id}>
                    <LeadCard lead={lead} staff={staff} today={today} onOpen={() => setOpenId(lead.id)} />
                  </li>
                ))}
                {items.length === 0 && <li className="rounded-xl border border-dashed border-border-strong px-3 py-6 text-center text-xs text-subtle">No leads</li>}
              </ul>
            </section>
          );
        })}
      </div>

      <details className="group mt-2 rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
          <span>
            Lost <span className="ml-1 font-normal text-muted tabular-nums">({lost.length})</span>
          </span>
          <ChevronDown className="size-4 text-subtle transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <ul className="divide-y divide-border border-t border-border">
          {lost.map((lead) => (
            <li key={lead.id}>
              <button type="button" onClick={() => setOpenId(lead.id)} className="flex min-h-12 w-full flex-col items-start gap-0.5 px-5 py-3 text-left hover:bg-paper-deep/40 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-sm font-medium text-ink">{lead.name}</span>
                <span className="text-xs text-muted sm:flex-1">{lead.lostReason ?? "No reason recorded"}</span>
                <span className="text-xs text-subtle tabular-nums">{formatDate(lead.lastActivityAt)}</span>
              </button>
            </li>
          ))}
          {lost.length === 0 && <li className="px-5 py-4 text-sm text-muted">No lost leads match the filters.</li>}
        </ul>
      </details>

      <LeadDrawer lead={open} staff={staff} mode={mode} onClose={() => setOpenId(null)} onStageChange={changeStage} />
    </div>
  );
}

function LeadCard({ lead, staff, today, onOpen }: { lead: Lead; staff: StaffMember[]; today: string; onOpen: () => void }) {
  const advisor = staff.find((s) => s.id === lead.advisorId);
  const followDays = lead.followUpAt ? daysBetween(today, lead.followUpAt) : null;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="w-full rounded-xl border border-border bg-card p-3 text-left shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-shadow hover:shadow-[var(--shadow-card)]"
    >
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink">{lead.name}</span>
          <span className="block font-mono text-[0.6875rem] text-subtle">{lead.reference}</span>
        </span>
        {advisor ? <Avatar initials={advisor.initials} className="size-7 text-[0.625rem]" /> : <span className="text-[0.6875rem] text-subtle">Unassigned</span>}
      </span>
      <span className="mt-2 block text-xs text-muted">
        {destinationLabels[lead.destination]} · {degreeLabels[lead.level]} · {lead.intake}
      </span>
      {lead.tags.length > 0 && (
        <span className="mt-2 flex flex-wrap gap-1">
          {lead.tags.map((t) => (
            <span key={t} className="rounded-full bg-paper-deep px-2 py-0.5 text-[0.6875rem] text-ink-soft">{t}</span>
          ))}
        </span>
      )}
      {followDays !== null && lead.followUpAt && (
        <span className={cn("mt-2 flex items-center gap-1.5 text-xs tabular-nums", followDays < 0 ? "text-danger" : followDays === 0 ? "text-terracotta-deep" : "text-muted")}>
          <CalendarClock className="size-3.5" aria-hidden="true" />
          Follow-up {formatDate(lead.followUpAt)}
          {followDays < 0 ? " · overdue" : followDays === 0 ? " · today" : ""}
        </span>
      )}
    </button>
  );
}
