import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Lock } from "lucide-react";
import { documentStatusLabels, sensitiveDocumentCategories } from "@/features/operations/types";
import { documentRequestStatusLabels, documentRequestStatusTone } from "@/features/documents/status";
import { DemoNotice, PageHeader, Panel, StatusPill, formatDate } from "@/components/dashboard/ui";
import { DemoUnavailable, DisabledActions, Facts } from "@/components/admin/admin-ui";
import { DocumentDates, StorageBoundary } from "@/components/admin/document-parts";
import { documentStatusTone } from "@/components/admin/format";
import { demoDocuments, isDemoWorkspaceEnabled, staffById, studentById } from "@/server/demo/workspace";
import { DocumentReview } from "@/components/documents/admin-documents";
import { getDocument } from "@/server/services/documents";

export const metadata: Metadata = { title: "Document review" };

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const live = /^[0-9a-f-]{36}$/.test(id) ? await getDocument(id) : null;
  if (live === undefined) notFound();
  if (live) {
    return (
      <div>
        <Link href="/admin/documents" className="mb-4 inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" /> Document centre
        </Link>
        <PageHeader
          eyebrow={live.type?.label ?? "Document"}
          title={live.title}
          description={<><Link href={`/admin/students/${live.case_id}`} className="text-primary hover:text-primary-deep">{live.studentName}</Link>{live.due_on ? ` · due ${formatDate(live.due_on)}` : ""}{live.expires_on ? ` · expires ${formatDate(live.expires_on)}` : ""}</>}
          actions={<StatusPill tone={documentRequestStatusTone[live.status]}>{documentRequestStatusLabels[live.status]}</StatusPill>}
        />
        {live.instructions && <p className="mt-4 max-w-2xl text-sm text-ink-soft">{live.instructions}</p>}
        <DocumentReview d={live} studentName={live.studentName} canWithdraw />
      </div>
    );
  }
  if (!isDemoWorkspaceEnabled()) {
    return (
      <div>
        <PageHeader eyebrow="Document centre" title="Document review" />
        <DemoUnavailable module="Document review" />
        <StorageBoundary className="mt-6" />
      </div>
    );
  }
  const doc = demoDocuments.find((d) => d.id === id);
  if (!doc) notFound();
  const student = studentById(doc.studentId);
  const sensitive = sensitiveDocumentCategories.includes(doc.category);
  const versions = [...doc.versions].reverse();

  return (
    <div>
      <Link href="/admin/documents" className="mb-4 inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> Document centre
      </Link>
      <PageHeader
        eyebrow={doc.category}
        title={doc.title}
        description={
          <>
            For{" "}
            <Link href={`/admin/students/${doc.studentId}`} className="font-medium text-primary underline-offset-4 hover:underline">
              {student?.name ?? "Unknown student"}
            </Link>
            . Requested {formatDate(doc.requestedAt)}.
          </>
        }
        actions={<StatusPill tone={documentStatusTone[doc.status]}>{documentStatusLabels[doc.status]}</StatusPill>}
      />
      <DemoNotice>This record is synthetic and has no file behind it.</DemoNotice>
      {sensitive && (
        <p role="note" className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-gold-soft px-4 py-3 text-sm text-gold-deep">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Sensitive category. Finance and marketing roles cannot open this document; access is limited to the assigned advisor, document reviewers and administrators.
        </p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <Panel title="Version history" bodyClassName="p-0">
            {versions.length === 0 ? (
              <p className="p-5 text-sm text-muted">Nothing uploaded yet. The student sees this as a request in their portal.</p>
            ) : (
              <ol className="divide-y divide-border">
                {versions.map((v) => (
                  <li key={v.version} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="size-4 text-subtle" aria-hidden="true" />
                      <span className="text-sm font-medium text-ink">v{v.version}</span>
                      <span className="min-w-0 truncate font-mono text-xs text-muted">{v.fileName}</span>
                      <StatusPill tone={documentStatusTone[v.status]} className="ml-auto">{documentStatusLabels[v.status]}</StatusPill>
                    </div>
                    <p className="mt-1 text-xs text-muted tabular-nums">Uploaded {formatDate(v.uploadedAt)}</p>
                    {v.feedback && (
                      <blockquote className="mt-2 rounded-lg border-l-2 border-terracotta-deep bg-paper-deep/60 px-3 py-2 text-sm text-ink-soft">
                        {v.feedback}
                        <footer className="mt-1 text-xs text-muted">— {staffById(v.reviewerId ?? null)?.name ?? "Reviewer"}</footer>
                      </blockquote>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
          <Panel title="Review">
            {doc.feedback && (
              <div className="mb-4">
                <p className="text-xs text-muted">Current feedback to the student</p>
                <p className="mt-1 text-sm text-ink">{doc.feedback}</p>
              </div>
            )}
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Feedback for the student
              <textarea disabled rows={3} aria-describedby="review-locked" className="cursor-not-allowed rounded-lg border border-border-strong bg-paper px-3 py-2 text-sm text-subtle" placeholder="Explain exactly what to fix…" />
            </label>
            <div className="mt-4">
              <DisabledActions
                id="review-locked"
                actions={["Approve", "Reject", "Request replacement", "Leave feedback"]}
                reason="Review actions go live with private Supabase Storage (signed URLs, per-student access). No real files are accepted yet."
              />
            </div>
          </Panel>
        </div>
        <div className="min-w-0 space-y-4">
          <Panel title="Details">
            <Facts
              className="sm:grid-cols-1"
              items={[
                { label: "Category", value: doc.category },
                { label: "Requested", value: formatDate(doc.requestedAt) },
                { label: "Due and expiry", value: <DocumentDates doc={doc} /> },
                { label: "Versions", value: <span className="tabular-nums">{doc.versions.length}</span> },
              ]}
            />
          </Panel>
          <StorageBoundary />
        </div>
      </div>
    </div>
  );
}
