import { FileCheck2, ShieldCheck } from "lucide-react";
import { downloadMyDocument } from "@/app/(student)/portal/documents/actions";
import { EmptyState, Panel, StatusPill, formatDate } from "@/components/dashboard/ui";
import { DocumentUpload } from "@/components/documents/document-upload";
import { OpenFileButton } from "@/components/documents/open-file-button";
import { documentRequestStatusLabels, documentRequestStatusTone, studentCanUpload, studentNextStep } from "@/features/documents/status";
import type { DocumentRequestStatus } from "@/lib/supabase/types";
import type { DocumentWithHistory } from "@/server/services/documents";

const groups: { title: string; statuses: DocumentRequestStatus[] }[] = [
  { title: "Needs your action", statuses: ["requested", "reupload_required", "expired"] },
  { title: "With your advisor", statuses: ["uploaded", "under_review", "rejected"] },
  { title: "Approved", statuses: ["approved"] },
  { title: "No longer needed", statuses: ["withdrawn"] },
];

function DocumentCard({ d }: { d: DocumentWithHistory }) {
  const current = d.versions.find((v) => v.state === "active");
  const feedback = d.reviews.find((r) => (r.action === "rejected" || r.action === "reupload_required" || r.action === "file_refused") && r.note);
  const canUpload = studentCanUpload(d.status);
  return (
    <li className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-ink">{d.title}</p>
          <p className="text-xs text-muted">{d.type?.label ?? "Document"}{current ? ` · version ${current.version}, sent ${formatDate(current.uploaded_at!)}` : ""}</p>
        </div>
        <StatusPill tone={documentRequestStatusTone[d.status]}>{documentRequestStatusLabels[d.status]}</StatusPill>
      </div>
      {d.instructions && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{d.instructions}</p>}
      {feedback && (canUpload || d.status === "rejected") && (
        <p className="mt-3 rounded-xl border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-ink-soft">
          <span className="font-medium text-danger">Feedback: </span>
          {feedback.note}
        </p>
      )}
      <p className="mt-3 text-sm text-muted">
        {studentNextStep(d.status)}
        {d.due_on && canUpload ? ` Due ${formatDate(d.due_on)}.` : ""}
        {d.expires_on && d.status === "approved" ? ` Valid until ${formatDate(d.expires_on)}.` : ""}
      </p>
      <div className="mt-4 flex flex-wrap items-start gap-3">
        {canUpload && <DocumentUpload requestId={d.id} label={current ? "Upload a new copy" : "Upload"} />}
        {current && <OpenFileButton mode="download" label="Download your copy" getLink={downloadMyDocument.bind(null, current.id)} />}
      </div>
    </li>
  );
}

/** The student's document centre: what's asked of them, what's with their advisor, what's done. */
export function StudentDocuments({ documents }: { documents: DocumentWithHistory[] }) {
  return (
    <div className="mt-8 grid gap-8">
      <div role="note" className="flex items-start gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4 text-sm text-ink-soft shadow-[var(--shadow-card)]">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Files you upload here are stored privately. Only you and the AsterPath staff who need them can open them, through links that expire after five
          minutes, and every opening is logged. Please don&apos;t send these documents by email or WhatsApp.
        </p>
      </div>
      {documents.length === 0 ? (
        <EmptyState icon={FileCheck2} title="No documents requested yet" description="When your advisor needs a document, it appears here with instructions." />
      ) : (
        groups.map((g) => {
          const docs = documents.filter((d) => g.statuses.includes(d.status));
          if (docs.length === 0) return null;
          return (
            <Panel key={g.title} title={`${g.title} (${docs.length})`}>
              <ul className="grid gap-3">
                {docs.map((d) => (
                  <DocumentCard key={d.id} d={d} />
                ))}
              </ul>
            </Panel>
          );
        })
      )}
    </div>
  );
}
