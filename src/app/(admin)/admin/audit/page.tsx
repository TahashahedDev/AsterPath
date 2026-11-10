import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyPanel } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = { title: "Audit log" };

const timeFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const actions = { insert: "Created", update: "Changed", delete: "Deleted" } as const;

/** The latest 100 recorded changes. Personal data is never stored here, only which fields changed. */
export default async function AuditPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <EmptyPanel title="Audit log" description="Connect Supabase to see the audit log." />;

  const { data: allowed } = await supabase.rpc("has_permission", { requested: "audit.read" });
  if (!allowed) {
    return <EmptyPanel title="Audit log" description="Your role does not include the audit log. Ask an owner or administrator if you need it." />;
  }

  const { data: events, error } = await supabase
    .from("audit_events")
    .select("id, occurred_at, actor_id, action, entity, entity_id, changed_columns")
    .order("occurred_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Audit log</h1>
      <p className="mt-2 text-muted">Every change to profiles, enquiries, the team and role permissions, newest first. Entries cannot be edited or deleted.</p>
      {error ? (
        <p className="mt-8 text-danger" role="alert">The audit log could not be loaded. Please try again.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card" tabIndex={0} role="region" aria-label="Audit events">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">When (IST)</th>
                <th scope="col" className="px-5 py-3 font-medium">What</th>
                <th scope="col" className="px-5 py-3 font-medium">Record</th>
                <th scope="col" className="px-5 py-3 font-medium">Fields</th>
                <th scope="col" className="px-5 py-3 font-medium">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(events ?? []).map((e) => (
                <tr key={e.id}>
                  <td className="px-5 py-3 whitespace-nowrap text-muted">{timeFormat.format(new Date(e.occurred_at))}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    {actions[e.action]} {e.entity.replace("_", " ")}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{e.entity_id}</td>
                  <td className="px-5 py-3">{e.changed_columns.join(", ") || "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">{e.actor_id ?? "System"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {events?.length === 0 && <p className="px-5 py-6 text-muted">No changes recorded yet.</p>}
        </div>
      )}
    </div>
  );
}
