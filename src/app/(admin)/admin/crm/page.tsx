import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";
import { LeadSourceNote } from "@/components/admin/admin-ui";
import { CrmBoard } from "@/components/admin/crm-board";
import { DEMO_TODAY, demoStaff, isDemoWorkspaceEnabled } from "@/server/demo/workspace";
import { getLeadDirectory, getTeamDirectory } from "@/server/services/lead-directory";

export const metadata: Metadata = { title: "CRM pipeline" };

export default async function CrmPage() {
  const directory = await getLeadDirectory();
  const isDemo = directory.source === "demo";
  // Demo staff only label demo leads; live leads use the real team.
  const staff = isDemo && isDemoWorkspaceEnabled() ? demoStaff : directory.source === "supabase" ? await getTeamDirectory() : [];
  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="CRM"
        description="Every enquiry from first message to signed agreement. Open a card for contact details, notes and stage actions."
        actions={
          <Link href="/admin/leads" className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium text-ink ring-1 ring-border-strong ring-inset hover:bg-ink/5">
            Table view
          </Link>
        }
      />
      {directory.source === "unavailable" ? (
        <div className="mt-8">
          <EmptyState icon={Inbox} title="Enquiries are not available" description={directory.reason} />
        </div>
      ) : (
        <>
          <LeadSourceNote source={directory.source} />
          <CrmBoard initialLeads={directory.leads} staff={staff} mode={isDemo ? "demo" : directory.source === "supabase" ? "live" : "readonly"} today={isDemo ? DEMO_TODAY : new Date().toISOString()} />
        </>
      )}
    </div>
  );
}
