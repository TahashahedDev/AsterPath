import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Video } from "lucide-react";
import { firstReplyWhatsappUrl } from "@/features/leads/reply";
import { bookingsForLead } from "@/server/services/bookings";
import { degreeLabels, destinationLabels } from "@/features/operations/types";
import { PageHeader, Panel, StatusPill, formatDate, formatDateTime } from "@/components/dashboard/ui";
import { Facts, LeadSourceNote } from "@/components/admin/admin-ui";
import { leadStageLabel, leadStageTone } from "@/components/admin/format";
import { staffById } from "@/server/demo/workspace";
import { getLeadDirectory, getTeamDirectory } from "@/server/services/lead-directory";
import { LeadAssignForm } from "@/components/admin/lead-assign-form";
import { LeadNoteForm, OpenCaseForm } from "@/components/admin/casework-forms";
import { getLeadWorkspace } from "@/server/services/cases";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Lead" };

const hostOf = (url?: string) => {
  try {
    return url ? new URL(url).host : undefined;
  } catch {
    return url;
  }
};

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const directory = await getLeadDirectory();
  const lead = directory.leads.find((l) => l.id === id);
  if (!lead) notFound();
  const isDemo = directory.source === "demo";
  const isLive = directory.source === "supabase";
  const [team, workspace, calls] = isLive ? await Promise.all([getTeamDirectory(), getLeadWorkspace(lead.id), bookingsForLead(lead.id)]) : [[], null, []];
  const notes = [...(workspace?.notes ?? []).map((n) => ({ at: n.created_at, authorId: n.author_id ?? "", body: n.body })), ...lead.notes];
  const advisor = isDemo ? staffById(lead.advisorId)?.name : team.find((m) => m.id === lead.advisorId)?.name;
  const author = (authorId: string) => (authorId === "enquiry" ? "Enquiry form" : ((isDemo ? staffById(authorId)?.name : team.find((m) => m.id === authorId)?.name) ?? "Team member"));

  return (
    <div>
      <Link href="/admin/leads" className="mb-4 inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> All leads
      </Link>
      <PageHeader
        eyebrow={lead.reference}
        title={lead.name}
        description={`${destinationLabels[lead.destination]} · ${degreeLabels[lead.level]} · ${lead.intake}`}
        actions={<StatusPill tone={leadStageTone(lead.stage)}>{leadStageLabel(lead.stage)}</StatusPill>}
      />
      <LeadSourceNote source={directory.source} />
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={firstReplyWhatsappUrl({ name: lead.name, email: lead.email, whatsapp: lead.whatsapp, reference: lead.reference, levelLabel: degreeLabels[lead.level] })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-on-primary hover:bg-primary-deep"
        >
          <MessageCircle className="size-4" aria-hidden="true" /> Reply on WhatsApp
        </a>
        <a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your AsterPath enquiry (${lead.reference})`)}`} className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-ink ring-1 ring-border-strong hover:bg-ink/5">
          <Mail className="size-4" aria-hidden="true" /> Email
        </a>
      </div>
      {calls.length > 0 && (
        <Panel title="Booked calls" className="mt-4">
          <ul className="divide-y divide-border">
            {calls.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className={c.status === "booked" ? "text-ink" : "text-muted line-through"}>
                  {formatDateTime(c.starts_at)} {c.status !== "booked" && `(${c.status})`}
                </span>
                {c.meeting_url && c.status === "booked" && (
                  <a href={c.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full px-4 font-medium text-ink ring-1 ring-border-strong hover:bg-ink/5">
                    <Video className="size-4" aria-hidden="true" /> Join Meet
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Contact and goal" className="lg:col-span-2">
          <Facts
            items={[
              { label: "Email", value: <a href={`mailto:${lead.email}`} className="text-primary underline-offset-4 hover:underline">{lead.email}</a> },
              { label: "WhatsApp", value: <span className="tabular-nums">{lead.whatsapp}</span> },
              { label: "Lives in", value: lead.residence },
              { label: "Source", value: lead.source },
              { label: "Advisor", value: advisor ?? (lead.advisorId ? "Assigned" : "Unassigned") },
              { label: "Follow-up", value: lead.followUpAt ? formatDateTime(lead.followUpAt) : "None set" },
              { label: "Enquired", value: formatDate(lead.createdAt) },
              { label: "Last activity", value: formatDate(lead.lastActivityAt) },
              ...(lead.lostReason ? [{ label: "Lost reason", value: lead.lostReason }] : []),
            ]}
          />
          {lead.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5" aria-label="Tags">
              {lead.tags.map((t) => (
                <StatusPill key={t}>{t}</StatusPill>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Next step">
          {isLive && <LeadAssignForm leadId={lead.id} advisorId={lead.advisorId} followUp={lead.followUpAt} staff={team} />}
          <p className={`text-sm leading-relaxed text-ink-soft ${isLive ? "mt-4" : ""}`}>
            Stage changes, conversion and lost reasons are handled on the{" "}
            <Link href="/admin/crm" className="font-medium text-primary underline-offset-4 hover:underline">CRM board</Link>.{" "}
            {isDemo ? "On demo data they are not saved." : isLive ? "Changes are saved and audited." : "Local enquiries are read-only until Supabase is connected."}
          </p>
        </Panel>
      </div>
      {workspace && (
        <Panel title="Quote and case" className="mt-4">
          {workspace.caseId ? (
            <p className="text-sm text-ink-soft">
              Case open.{" "}
              <Link href={`/admin/students/${workspace.caseId}`} className="font-medium text-primary underline-offset-4 hover:underline">Go to the student case</Link>
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                {workspace.quotes.length === 0 ? (
                  <p className="text-sm text-muted">No quote saved yet.</p>
                ) : (
                  <ul className="grid gap-1.5 text-sm">
                    {workspace.quotes.map((q) => (
                      <li key={q.id} className="flex justify-between gap-3"><span className="text-ink-soft">Saved {formatDateTime(q.created_at)}</span><span className="tabular-nums text-ink">{formatInr(q.total)}</span></li>
                    ))}
                  </ul>
                )}
                <Link href={`/admin/pricing?lead=${lead.id}`} className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-primary underline-offset-4 hover:underline">Build a quote for this lead</Link>
              </div>
              {workspace.quotes.length > 0 && <OpenCaseForm leadId={lead.id} quotes={workspace.quotes.map((q) => ({ id: q.id, total: q.total, createdAt: q.created_at }))} />}
            </div>
          )}
        </Panel>
      )}
      {lead.visit && (
        <Panel title="How they found us" className="mt-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-muted">Came from</dt><dd className="text-ink">{lead.visit.source ?? hostOf(lead.visit.referrer) ?? "Direct visit"}</dd></div>
            {lead.visit.campaign && <div><dt className="text-xs text-muted">Campaign</dt><dd className="text-ink">{lead.visit.campaign}</dd></div>}
            {lead.visit.landingPage && <div><dt className="text-xs text-muted">First page</dt><dd className="break-all text-ink">{lead.visit.landingPage}</dd></div>}
          </dl>
          {lead.visit.pages.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted">Read before enquiring, in order</p>
              <ol className="mt-2 flex flex-wrap gap-1.5">
                {lead.visit.pages.map((p, i) => (
                  <li key={`${p}-${i}`} className="rounded-full bg-paper-deep px-2.5 py-1 text-xs text-ink-soft">{p}</li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-muted">Open the call with what they were reading about.</p>
            </div>
          )}
        </Panel>
      )}
      <Panel title="Notes" className="mt-4">
        {isLive && <div className="mb-5"><LeadNoteForm leadId={lead.id} /></div>}
        {notes.length === 0 ? (
          <p className="text-sm text-muted">No notes yet.</p>
        ) : (
          <ol className="space-y-4 border-l border-border pl-5">
            {notes.map((n) => (
              <li key={n.at + n.authorId}>
                <p className="text-sm whitespace-pre-line text-ink">{n.body}</p>
                <p className="mt-1 text-xs text-muted tabular-nums">
                  {author(n.authorId)} · <time dateTime={n.at}>{formatDateTime(n.at)}</time>
                </p>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}
