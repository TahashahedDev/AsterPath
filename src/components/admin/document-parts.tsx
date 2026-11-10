import type { StudentDocument } from "@/features/operations/types";
import { formatDate } from "@/components/dashboard/ui";
import { RuleList } from "@/components/admin/admin-ui";
import { daysBetween } from "@/components/admin/format";
import { DEMO_TODAY } from "@/server/demo/workspace";

/** Due date and expiry, flagged when expired or expiring within 60 days. */
export function DocumentDates({ doc }: { doc: StudentDocument }) {
  const parts: React.ReactNode[] = [];
  if (doc.dueAt) {
    const late = daysBetween(DEMO_TODAY, doc.dueAt) < 0 && doc.status !== "approved";
    parts.push(
      <span key="due" className={late ? "text-danger" : undefined}>
        Due {formatDate(doc.dueAt)}
        {late ? " · late" : ""}
      </span>,
    );
  }
  if (doc.expiresAt) {
    const days = daysBetween(DEMO_TODAY, doc.expiresAt);
    parts.push(
      <span key="exp" className={days < 0 ? "font-medium text-danger" : days <= 60 ? "font-medium text-terracotta-deep" : "text-muted"}>
        {days < 0 ? `Expired ${formatDate(doc.expiresAt)}` : days <= 60 ? `Expires in ${days} days` : `Valid to ${formatDate(doc.expiresAt)}`}
      </span>,
    );
  }
  if (parts.length === 0) return <span className="text-muted">—</span>;
  return <span className="flex flex-col gap-0.5 text-xs tabular-nums">{parts}</span>;
}

/** What must exist before AsterPath accepts a single real document. */
export function StorageBoundary({ className }: { className?: string }) {
  return (
    <RuleList
      className={className}
      title="Security boundary — required before real documents are accepted"
      items={[
        "A private Supabase Storage bucket; no public URLs, ever.",
        "Row Level Security per student and per staff role: students see only their own files; finance and marketing never see sensitive categories.",
        "Short-lived signed URLs generated on the server for each view or download, and every access written to the audit log.",
        "File type and size validation on upload (PDF, JPG, PNG, DOCX; size cap), with content-type sniffing rather than trusting the extension.",
        "A written retention policy: how long each category is kept after the case closes, and how deletion requests are honoured.",
      ]}
    />
  );
}
