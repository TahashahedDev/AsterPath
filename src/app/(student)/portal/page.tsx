import { EmptyPanel } from "@/components/dashboard/dashboard-shell";

const panels = [
  { title: "Current stage", description: "Derived from your case workflow once it is assigned, never estimated." },
  { title: "Outstanding tasks", description: "Tasks your advisor assigns to you, with due dates and who is responsible." },
  { title: "Documents awaiting review", description: "Uploads and their review status, with feedback from your reviewer." },
  { title: "Next deadline", description: "The nearest deadline across your applications and tasks." },
  { title: "Outstanding payment", description: "Your next milestone payment, from your written agreement." },
  { title: "Your advisor", description: "The person responsible for your case." },
];

export default function PortalOverviewPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Overview</h1>
      <p className="mt-2 text-muted">Each panel below will show the signed-in student&rsquo;s own data. Nothing is connected yet.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {panels.map((panel) => (
          <EmptyPanel key={panel.title} {...panel} />
        ))}
      </div>
    </div>
  );
}
