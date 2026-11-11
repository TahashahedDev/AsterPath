import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { applicationStatusLabels, destinationLabels, type Application } from "@/features/operations/types";
import { DataTable, DemoNotice, EmptyState, PageHeader, StatusPill, formatDate, type Column } from "@/components/dashboard/ui";
import { DemoUnavailable, FilterBar } from "@/components/admin/admin-ui";
import { applicationStatuses, applicationStatusTone, daysBetween, param, relativeDays } from "@/components/admin/format";
import { DEMO_TODAY, demoApplications, isDemoWorkspaceEnabled, staffById, studentById } from "@/server/demo/workspace";
import { cn } from "@/lib/utils";
import { LiveApplications } from "@/components/admin/live-lists";
import { listAllApplications } from "@/server/services/cases";

export const metadata: Metadata = { title: "Applications" };

function Deadline({ app }: { app: Application }) {
  const days = daysBetween(DEMO_TODAY, app.deadline);
  const open = !app.submittedAt;
  const urgent = open && days >= 0 && days <= 21;
  const missed = open && days < 0;
  return (
    <span className={cn("inline-flex flex-col tabular-nums", urgent && "font-medium text-terracotta-deep", missed && "font-medium text-danger")}>
      {formatDate(app.deadline)}
      {(urgent || missed) && <span className="text-xs font-normal">{missed ? "Missed" : relativeDays(days)}</span>}
    </span>
  );
}

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const header = <PageHeader eyebrow="Casework" title="Applications" description="Every university application as its own row. Deadlines within three weeks are highlighted." />;
  const live = await listAllApplications();
  if (live) return <div>{header}<LiveApplications rows={live} now={new Date()} /></div>;
  if (!isDemoWorkspaceEnabled()) return <div>{header}<DemoUnavailable module="Applications" /></div>;

  const status = param((await searchParams).status);
  const rows = [...demoApplications].filter((a) => !status || a.status === status).sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline));

  const columns: Column<Application>[] = [
    { key: "university", header: "University", cell: (a) => a.university },
    {
      key: "student",
      header: "Student",
      cell: (a) => (
        <Link href={`/admin/students/${a.studentId}`} className="underline-offset-4 hover:text-primary hover:underline">
          {studentById(a.studentId)?.name ?? "—"}
        </Link>
      ),
    },
    { key: "programme", header: "Programme", cell: (a) => a.programme, className: "min-w-48" },
    { key: "country", header: "Country", cell: (a) => `${destinationLabels[a.country]} · ${a.intake}`, desktopOnly: true },
    { key: "deadline", header: "Deadline", cell: (a) => <Deadline app={a} />, className: "whitespace-nowrap" },
    { key: "submitted", header: "Submitted", cell: (a) => (a.submittedAt ? formatDate(a.submittedAt) : "—"), className: "whitespace-nowrap tabular-nums" },
    { key: "status", header: "Status", cell: (a) => <StatusPill tone={applicationStatusTone[a.status]}>{applicationStatusLabels[a.status]}</StatusPill> },
    { key: "advisor", header: "Advisor", cell: (a) => staffById(a.advisorId)?.name ?? "—", desktopOnly: true },
    { key: "reference", header: "Reference", cell: (a) => (a.reference ? <span className="font-mono text-xs">{a.reference}</span> : "—"), desktopOnly: true },
    { key: "docs", header: "Docs", cell: (a) => <span className="tabular-nums" title={a.requiredDocuments.join(", ")}>{a.requiredDocuments.length}</span>, className: "text-right" },
  ];

  return (
    <div>
      {header}
      <DemoNotice />
      <FilterBar
        action="/admin/applications"
        fields={[{ name: "status", label: "Status", value: status, options: applicationStatuses.map((s) => ({ value: s, label: applicationStatusLabels[s] })) }]}
        resultLabel={`${rows.length} of ${demoApplications.length} applications`}
      />
      <div className="mt-4">
        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title="No applications with this status" description="Choose another status or clear the filter." />
        ) : (
          <DataTable rows={rows} columns={columns} rowKey={(a) => a.id} primary="university" caption="University applications" />
        )}
      </div>
    </div>
  );
}
