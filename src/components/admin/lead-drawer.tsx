"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, X } from "lucide-react";
import { degreeLabels, destinationLabels, leadStages, type Lead, type LeadStage, type StaffMember } from "@/features/operations/types";
import { StatusPill, formatDate, formatDateTime } from "@/components/dashboard/ui";
import { leadStageLabel, leadStageTone } from "@/components/admin/format";
import { firstReplyWhatsappUrl } from "@/features/leads/reply";

export type BoardMode = "demo" | "live" | "readonly";

/**
 * Side sheet for one lead. Built on the native <dialog> so focus is trapped,
 * Esc closes it and focus returns to the card that opened it.
 */
export function LeadDrawer({
  lead,
  staff,
  mode,
  onClose,
  onStageChange,
}: {
  lead: Lead | null;
  staff: StaffMember[];
  mode: BoardMode;
  onClose: () => void;
  onStageChange: (id: string, stage: LeadStage, lostReason?: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const noteId = useId();
  const [lostReason, setLostReason] = useState("");
  const editable = mode !== "readonly";

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (lead && !dialog.open) dialog.showModal();
    if (!lead && dialog.open) dialog.close();
  }, [lead]);

  const advisor = staff.find((s) => s.id === lead?.advisorId);
  const authorName = (id: string) => (id === "enquiry" ? "Enquiry form" : (staff.find((s) => s.id === id)?.name ?? "Team member"));

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => {
        setLostReason("");
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md overflow-y-auto border-l border-border bg-card p-0 text-ink shadow-[var(--shadow-lift)] backdrop:bg-inverse/50"
    >
      {lead && (
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-10 flex items-start gap-3 border-b border-border bg-card px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted">{lead.reference}</p>
              <h2 id={titleId} className="display mt-1 text-2xl leading-tight text-ink">
                {lead.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <StatusPill tone={leadStageTone(lead.stage)}>{leadStageLabel(lead.stage)}</StatusPill>
                {lead.tags.map((t) => (
                  <StatusPill key={t}>{t}</StatusPill>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => ref.current?.close()} className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5" aria-label="Close lead details">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 space-y-6 px-5 py-5">
            <section aria-label="Contact">
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${lead.email}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-strong px-3 text-sm hover:bg-ink/5">
                  <Mail className="size-4 text-subtle" aria-hidden="true" />
                  <span className="max-w-[14rem] truncate">{lead.email}</span>
                </a>
                <span className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-strong px-3 text-sm tabular-nums">
                  <MessageCircle className="size-4 text-subtle" aria-hidden="true" />
                  {lead.whatsapp}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  ["Destination", destinationLabels[lead.destination]],
                  ["Level", degreeLabels[lead.level]],
                  ["Intake", lead.intake],
                  ["Lives in", lead.residence],
                  ["Source", lead.source],
                  ["Advisor", advisor?.name ?? (lead.advisorId ? "Assigned" : "Unassigned")],
                  ["Follow-up", lead.followUpAt ? formatDateTime(lead.followUpAt) : "None set"],
                  ["Enquired", formatDate(lead.createdAt)],
                ].map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="mt-0.5 break-words text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              {lead.stage === "lost" && lead.lostReason && <p className="mt-3 rounded-lg bg-paper-deep px-3 py-2 text-sm text-ink-soft">Lost: {lead.lostReason}</p>}
              <a
                href={firstReplyWhatsappUrl({ name: lead.name, email: lead.email, whatsapp: lead.whatsapp, reference: lead.reference, levelLabel: degreeLabels[lead.level] })}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-deep"
              >
                <MessageCircle className="size-4" aria-hidden="true" /> Reply on WhatsApp
              </a>
            </section>

            <section aria-labelledby={`${titleId}-notes`}>
              <h3 id={`${titleId}-notes`} className="text-xs font-semibold tracking-[0.14em] text-subtle uppercase">Notes</h3>
              {lead.notes.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No notes yet.</p>
              ) : (
                <ol className="mt-3 space-y-3 border-l border-border pl-4">
                  {lead.notes.map((n) => (
                    <li key={n.at + n.authorId}>
                      <p className="text-sm text-ink">{n.body}</p>
                      <p className="mt-0.5 text-xs text-muted tabular-nums">
                        {authorName(n.authorId)} · <time dateTime={n.at}>{formatDateTime(n.at)}</time>
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section aria-labelledby={`${titleId}-actions`} className="rounded-xl border border-border bg-paper-deep/50 p-4">
              <h3 id={`${titleId}-actions`} className="text-xs font-semibold tracking-[0.14em] text-subtle uppercase">Pipeline</h3>
              <p id={noteId} className="mt-1 text-xs text-warning-fg">
                {mode === "live" ? "Changes save immediately and are recorded in the audit log." : editable ? "Demo: changes are not saved. They reset when you leave the page." : "Local enquiries are read-only. Connect Supabase to manage the pipeline."}
              </p>
              <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-muted">
                Move to stage
                <select
                  value={lead.stage}
                  disabled={!editable}
                  aria-describedby={noteId}
                  onChange={(e) => onStageChange(lead.id, e.target.value as LeadStage)}
                  className="h-10 rounded-lg border border-border-strong bg-card px-2.5 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {leadStages.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                  <option value="lost" disabled>
                    Lost (use Mark lost below)
                  </option>
                </select>
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!editable || lead.stage === "converted"}
                  aria-describedby={noteId}
                  onClick={() => onStageChange(lead.id, "converted")}
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Convert to student
                </button>
              </div>
              <form
                className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!lostReason.trim()) return;
                  onStageChange(lead.id, "lost", lostReason.trim());
                  setLostReason("");
                }}
              >
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-muted">
                  Lost reason
                  <input
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    disabled={!editable}
                    required
                    maxLength={120}
                    placeholder="e.g. Chose another consultancy"
                    className="h-10 rounded-lg border border-border-strong bg-card px-3 text-sm text-ink placeholder:text-subtle disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
                <button
                  type="submit"
                  disabled={!editable || !lostReason.trim()}
                  className="h-10 rounded-lg border border-border-strong px-4 text-sm font-medium text-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Mark lost
                </button>
              </form>
            </section>

            <Link href={`/admin/leads/${lead.id}`} className="inline-flex min-h-10 items-center text-sm font-medium text-primary underline-offset-4 hover:underline">
              Open full lead record
            </Link>
          </div>
        </div>
      )}
    </dialog>
  );
}
