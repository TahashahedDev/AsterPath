import Link from "next/link";
import { FileSearch, Lock, ShieldAlert } from "lucide-react";
import { openDocumentVersion } from "@/app/(admin)/admin/documents/actions";
import { DataTable, EmptyState, Panel, StatusPill, formatDate, type Column } from "@/components/dashboard/ui";
import { RequestDocumentForm, ReviewDocumentForm } from "@/components/documents/admin-document-forms";
import { OpenFileButton } from "@/components/documents/open-file-button";
import { documentRequestStatusLabels, documentRequestStatusTone, queueOrder, reviewActionLabels, reviewActions } from "@/features/documents/status";
import type { DocumentTypeRow } from "@/lib/supabase/types";
import type { DocumentWithHistory, QueueRow } from "@/server/services/documents";

const kb = (bytes: number | null) => (bytes == null ? "" : bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

function Sensitive({ type }: { type: DocumentTypeRow | null }) {
  if (!type || type.sensitivity === "standard") return null;
  return <Lock className="size-3.5 shrink-0 text-terracotta-deep" role="img" aria-label={type.sensitivity === "financial" ? "Financial document" : "Identity document"} />;
}

/** The review queue: uploads waiting first, then expired and replacements, then the rest. */
export function DocumentQueue({ rows }: { rows: QueueRow[] }) {
  const sorted = [...rows].sort((a, b) => queueOrder.indexOf(a.status) - queueOrder.indexOf(b.status) || b.updated_at.localeCompare(a.updated_at));
  const columns: Column<QueueRow>[] = [
    { key: "title", header: "Document", cell: (d) => <span className="inline-flex items-center gap-1.5"><Sensitive type={d.type} />{d.title}</span> },
    { key: "student", header: "Student", cell: (d) => d.studentName },
    { key: "type", header: "Type", cell: (d) => d.type?.label ?? d.type_key, desktopOnly: true },
    { key: "status", header: "Status", cell: (d) => <StatusPill tone={documentRequestStatusTone[d.status]}>{documentRequestStatusLabels[d.status]}</StatusPill> },
    { key: "version", header: "Latest", cell: (d) => (d.current_version ? <span className="tabular-nums">v{d.current_version}</span> : "No upload"), className: "whitespace-nowrap" },
    {
      key: "dates",
      header: "Due / expiry",
      cell: (d) => (
        <span className="flex flex-col text-xs tabular-nums">
          {d.due_on && <span>Due {formatDate(d.due_on)}</span>}
          {d.expires_on && <span className={d.status === "expired" ? "text-danger" : "text-muted"}>Expires {formatDate(d.expires_on)}</span>}
          {!d.due_on && !d.expires_on && <span className="text-muted">—</span>}
        </span>
      ),
    },
  ];
  if (sorted.length === 0) return <EmptyState icon={FileSearch} title="No documents match" description="Request documents from a student's case page; they appear here as they move through review." />;
  return <DataTable rows={sorted} columns={columns} rowKey={(d) => d.id} primary="title" caption="Document review queue" href={(d) => `/admin/documents/${d.id}`} />;
}

/** On a student's case: what has been requested, and a form to request more. */
export function CaseDocumentsPanel({ caseId, documents, types }: { caseId: string; documents: DocumentWithHistory[]; types: DocumentTypeRow[] }) {
  return (
    <Panel title="Documents" className="mt-4">
      <RequestDocumentForm caseId={caseId} types={types} />
      {documents.length > 0 && (
        <ul className="mt-5 divide-y divide-border">
          {documents.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <Link href={`/admin/documents/${d.id}`} className="inline-flex min-w-0 items-center gap-1.5 font-medium text-ink hover:text-primary">
                <Sensitive type={d.type} />
                {d.title}
              </Link>
              <StatusPill tone={documentRequestStatusTone[d.status]}>{documentRequestStatusLabels[d.status]}</StatusPill>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** One document: its files (each opened through a fresh five-minute link), the decision, and the history. */
export function DocumentReview({ d, studentName, canWithdraw }: { d: DocumentWithHistory; studentName: string; canWithdraw: boolean }) {
  const decisions = reviewActions(d.status);
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <div className="grid gap-4 lg:col-span-2">
        <Panel title="Files">
          {d.versions.length === 0 ? (
            <p className="text-sm text-muted">
              {d.current_version ? "You don't have access to these files (financial documents open for owner, admin and finance only)." : `${studentName} hasn't uploaded anything yet.`}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {d.versions.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      Version {v.version} {v.state === "superseded" && <span className="text-xs font-normal text-muted">(replaced)</span>}
                      {v.state === "rejected_file" && <span className="text-xs font-normal text-danger">(refused, deleted)</span>}
                    </p>
                    <p className="text-xs break-all text-muted">
                      {v.original_filename}
                      {v.uploaded_at && ` · ${formatDate(v.uploaded_at)}`}
                      {v.size_bytes ? ` · ${kb(v.size_bytes)}` : ""}
                    </p>
                    {v.state !== "rejected_file" && v.scan_status === "not_scanned" && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-terracotta-deep">
                        <ShieldAlert className="size-3.5" aria-hidden="true" /> Not virus-scanned (no scanner connected yet). Checked as a genuine {v.mime_type === "application/pdf" ? "PDF" : "image"}.
                      </p>
                    )}
                  </div>
                  {(v.state === "active" || v.state === "superseded") && (
                    <OpenFileButton mode="preview" label="Open" getLink={openDocumentVersion.bind(null, v.id, d.id)} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        {(decisions.length > 0 || (canWithdraw && d.status !== "withdrawn")) && (
          <Panel title="Decision">
            {d.status === "uploaded" && <p className="mb-3 text-sm text-muted">Open the file first: opening it starts the review, and the decision buttons appear.</p>}
            <ReviewDocumentForm requestId={d.id} versionId={d.versions.find((v) => v.state === "active")?.id ?? ""} decisions={decisions} canWithdraw={canWithdraw && d.status !== "withdrawn"} />
          </Panel>
        )}
      </div>
      <Panel title="History">
        {d.reviews.length === 0 ? (
          <p className="text-sm text-muted">Nothing yet.</p>
        ) : (
          <ol className="grid gap-3 text-sm">
            {d.reviews.map((r) => (
              <li key={r.id}>
                <p className="font-medium text-ink">{reviewActionLabels[r.action]}</p>
                <p className="text-xs text-muted">{formatDate(r.created_at)}</p>
                {r.note && <p className="mt-1 text-ink-soft">{r.note}</p>}
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}
