import type { Metadata } from "next";
import type { Student } from "@/features/operations/types";
import { degreeLabels, destinationLabels } from "@/features/operations/types";
import { DataTable, DemoNotice, PageHeader, StatusPill, formatDate, type Column } from "@/components/dashboard/ui";
import { DemoUnavailable } from "@/components/admin/admin-ui";
import { LiveCaseList } from "@/components/admin/live-casework";
import { listCases } from "@/server/services/cases";
import { getTeamDirectory } from "@/server/services/lead-directory";
import { workflowLabel } from "@/components/admin/format";
import { openTasksFor } from "@/components/admin/workspace-data";
import { demoStudents, isDemoWorkspaceEnabled, staffById } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Students" };

export default async function StudentsPage() {
  const header = <PageHeader eyebrow="Casework" title="Students" description="Everyone with an open case: where they are in the journey, who owns it and what is outstanding." />;
  const cases = await listCases();
  if (cases) return <div>{header}<LiveCaseList cases={cases} team={await getTeamDirectory()} /></div>;
  if (!isDemoWorkspaceEnabled()) return <div>{header}<DemoUnavailable module="The student directory" /></div>;

  const columns: Column<Student>[] = [
    { key: "name", header: "Student", cell: (s) => s.name },
    { key: "destination", header: "Destination", cell: (s) => `${destinationLabels[s.destination]} · ${degreeLabels[s.level]}` },
    { key: "course", header: "Course", cell: (s) => s.course, desktopOnly: true },
    { key: "intake", header: "Intake", cell: (s) => s.intake, className: "whitespace-nowrap" },
    { key: "advisor", header: "Advisor", cell: (s) => staffById(s.advisorId)?.name ?? "Unassigned", desktopOnly: true },
    { key: "stage", header: "Stage", cell: (s) => <StatusPill tone="primary">{workflowLabel(s.stage)}</StatusPill> },
    {
      key: "tasks",
      header: "Open tasks",
      cell: (s) => {
        const n = openTasksFor(s.id).length;
        return <span className={n > 0 ? "font-medium text-ink tabular-nums" : "text-muted tabular-nums"}>{n}</span>;
      },
      className: "text-right md:w-24",
    },
    { key: "activity", header: "Last activity", cell: (s) => formatDate(s.lastActivityAt), className: "whitespace-nowrap tabular-nums" },
  ];

  return (
    <div>
      {header}
      <DemoNotice />
      <div className="mt-6">
        <DataTable rows={demoStudents} columns={columns} rowKey={(s) => s.id} primary="name" caption="Students" href={(s) => `/admin/students/${s.id}`} />
      </div>
    </div>
  );
}
