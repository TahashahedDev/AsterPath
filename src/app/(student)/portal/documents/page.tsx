import type { Metadata } from "next";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { DemoNotice, PageHeader, StatusPill, formatDate } from "@/components/dashboard/ui";
import { DisabledAction } from "@/components/portal/disabled-action";
import { DueLabel } from "@/components/portal/due-label";
import { PortalUnavailable } from "@/components/portal/portal-unavailable";
import { documentTone } from "@/components/portal/tones";
import { documentCategories, documentStatusLabels, type StudentDocument } from "@/features/operations/types";
import { daysUntil, getDemoPortal } from "@/server/demo/portal";
import { isPortalDemoEnabled } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Documents" };

const uploadReason = "Secure uploads open once our private document storage is live. Please don't send passports or bank statements over email or WhatsApp in the meantime.";

export default function DocumentsPage() {
  const header = <PageHeader eyebrow="Document centre" title="Your documents" description="Everything we've requested, its review status and any feedback from your reviewer." />;
  if (!isPortalDemoEnabled()) return <>{header}<PortalUnavailable what="documents" /></>;
  const p = getDemoPortal();
  const groups = documentCategories.map((c) => ({ category: c, docs: p.documents.filter((d) => d.category === c) })).filter((g) => g.docs.length);

  return (
    <div>
      {header}
      <DemoNotice />
      <div role="note" className="mt-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4 text-sm text-ink-soft shadow-[var(--shadow-card)]">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p>{uploadReason}</p>
      </div>
      <div className="mt-8 space-y-8">
        {groups.map((g) => (
          <section key={g.category} aria-labelledby={`cat-${slug(g.category)}`}>
            <h2 id={`cat-${slug(g.category)}`} className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">
              {g.category}
            </h2>
            <ul className="mt-3 space-y-3">
              {g.docs.map((d) => (
                <li key={d.id}>
                  <DocumentCard doc={d} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function DocumentCard({ doc }: { doc: StudentDocument }) {
  const needsAction = doc.status === "reupload_required" || doc.status === "rejected";
  const expiringSoon = doc.expiresAt && daysUntil(doc.expiresAt) <= 180;
  return (
    <article className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="min-w-0 font-semibold text-ink">{doc.title}</h3>
        <StatusPill tone={documentTone[doc.status]}>{documentStatusLabels[doc.status]}</StatusPill>
      </div>
      <div className="mt-2 flex flex-col gap-1 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-5">
        {doc.dueAt && doc.status !== "approved" && <DueLabel iso={doc.dueAt} />}
        {doc.expiresAt && (
          <span className={expiringSoon ? "font-medium text-danger" : undefined}>
            {daysUntil(doc.expiresAt) < 0 ? "Expired" : "Expires"} <time dateTime={doc.expiresAt}>{formatDate(doc.expiresAt)}</time>
          </span>
        )}
        {!doc.versions.length && <span>Not uploaded yet</span>}
      </div>

      {doc.feedback && (
        <div className={needsAction || doc.status === "expired" ? "mt-4 flex gap-3 rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-ink" : "mt-4 rounded-xl bg-paper-deep p-4 text-sm text-ink-soft"}>
          {(needsAction || doc.status === "expired") && <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />}
          <p>
            <strong className="font-semibold">Reviewer feedback:</strong> {doc.feedback}
          </p>
        </div>
      )}

      {doc.versions.length > 0 && (
        <details className="group mt-4 rounded-xl border border-border">
          <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-medium text-ink-soft select-none hover:text-ink">
            Version history ({doc.versions.length})
          </summary>
          <ol className="divide-y divide-border border-t border-border">
            {[...doc.versions].reverse().map((v) => (
              <li key={v.version} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0 break-all text-ink">
                    v{v.version} · {v.fileName}
                  </span>
                  <StatusPill tone={documentTone[v.status]}>{documentStatusLabels[v.status]}</StatusPill>
                </div>
                <p className="mt-0.5 text-xs text-muted">Uploaded {formatDate(v.uploadedAt)}</p>
                {v.feedback && <p className="mt-1.5 text-xs text-ink-soft">“{v.feedback}”</p>}
              </li>
            ))}
          </ol>
        </details>
      )}

      <DisabledAction
        id={`upload-${doc.id}`}
        className="mt-4"
        variant={needsAction || !doc.versions.length ? "primary" : "secondary"}
        label={doc.versions.length ? "Replace file" : "Upload file"}
        reason="Secure uploads open once our private document storage is live."
      />
    </article>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
