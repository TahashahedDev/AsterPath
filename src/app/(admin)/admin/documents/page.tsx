import type { Metadata } from "next";
import { Lock, SearchX } from "lucide-react";
import { documentCategories, documentStatusLabels, sensitiveDocumentCategories, type DocumentStatus, type StudentDocument } from "@/features/operations/types";
import { DataTable, DemoNotice, EmptyState, PageHeader, StatusPill, type Column } from "@/components/dashboard/ui";
import { DemoUnavailable, FilterBar } from "@/components/admin/admin-ui";
import { DocumentDates, StorageBoundary } from "@/components/admin/document-parts";
import { documentStatusTone, param, pendingDocumentStatuses } from "@/components/admin/format";
import { demoDocuments, isDemoWorkspaceEnabled, studentById } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Document centre" };

const statusOrder = (s: DocumentStatus) => (pendingDocumentStatuses.includes(s) ? 0 : s === "expired" ? 1 : 2);

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const header = <PageHeader eyebrow="Operations" title="Document centre" description="The review queue for every student file: what is waiting, what needs a re-upload and what is about to expire." />;
  if (!isDemoWorkspaceEnabled()) return <div>{header}<DemoUnavailable module="The document centre" /><StorageBoundary className="mt-6" /></div>;

  const sp = await searchParams;
  const status = param(sp.status);
  const category = param(sp.category);
  const rows = demoDocuments.filter((d) => (!status || d.status === status) && (!category || d.category === category)).sort((a, b) => statusOrder(a.status) - statusOrder(b.status));

  const columns: Column<StudentDocument>[] = [
    {
      key: "title",
      header: "Document",
      cell: (d) => (
        <span className="inline-flex items-center gap-1.5">
          {sensitiveDocumentCategories.includes(d.category) && <Lock className="size-3.5 shrink-0 text-terracotta-deep" role="img" aria-label="Sensitive document" />}
          {d.title}
        </span>
      ),
    },
    { key: "student", header: "Student", cell: (d) => studentById(d.studentId)?.name ?? "—" },
    { key: "category", header: "Category", cell: (d) => d.category, desktopOnly: true },
    { key: "status", header: "Status", cell: (d) => <StatusPill tone={documentStatusTone[d.status]}>{documentStatusLabels[d.status]}</StatusPill> },
    { key: "version", header: "Latest", cell: (d) => (d.versions.length ? <span className="tabular-nums">v{d.versions.at(-1)!.version}</span> : "No upload"), className: "whitespace-nowrap" },
    { key: "dates", header: "Due / expiry", cell: (d) => <DocumentDates doc={d} /> },
  ];

  const usedCategories = documentCategories.filter((c) => demoDocuments.some((d) => d.category === c));

  return (
    <div>
      {header}
      <DemoNotice>Every file name and status here is synthetic. No real document has been uploaded, and none can be yet.</DemoNotice>
      <FilterBar
        action="/admin/documents"
        fields={[
          { name: "status", label: "Status", value: status, options: (Object.keys(documentStatusLabels) as DocumentStatus[]).map((s) => ({ value: s, label: documentStatusLabels[s] })) },
          { name: "category", label: "Category", value: category, options: usedCategories.map((c) => ({ value: c, label: c })) },
        ]}
        resultLabel={`${rows.length} of ${demoDocuments.length} documents`}
      />
      <p className="mt-3 flex items-start gap-2 text-xs text-muted">
        <Lock className="mt-0.5 size-3.5 shrink-0 text-terracotta-deep" aria-hidden="true" />
        Sensitive categories ({sensitiveDocumentCategories.join(", ")}) cannot be opened by finance or marketing roles.
      </p>
      <div className="mt-4">
        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title="No documents match" description="Try another status or category." />
        ) : (
          <DataTable rows={rows} columns={columns} rowKey={(d) => d.id} primary="title" caption="Document review queue" href={(d) => `/admin/documents/${d.id}`} />
        )}
      </div>
      <StorageBoundary className="mt-6" />
    </div>
  );
}
