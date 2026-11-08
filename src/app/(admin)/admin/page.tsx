import { EmptyPanel } from "@/components/dashboard/dashboard-shell";

const kpis = [
  { title: "New leads", description: "Enquiries created in the selected period." },
  { title: "Active students", description: "Converted students with an open case." },
  { title: "Applications in progress", description: "Applications not yet decided by the institution." },
  { title: "Documents under review", description: "Uploads waiting for a reviewer." },
  { title: "Overdue tasks", description: "Open tasks past their due date." },
  { title: "Collected payments", description: "Verified payments received. Unpaid invoices are never counted as revenue." },
  { title: "Outstanding balances", description: "Milestones due or overdue but not yet paid." },
  { title: "Referral conversions", description: "Referred leads that became paying students." },
];

export default function AdminOverviewPage() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Overview</h1>
      <p className="mt-2 text-muted">Operational KPIs with their definitions. Values appear once the database is connected — none are estimated.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <EmptyPanel key={kpi.title} {...kpi} />
        ))}
      </div>
    </div>
  );
}
