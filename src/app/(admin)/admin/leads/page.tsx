import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, SearchX } from "lucide-react";
import { degreeLabels, destinationLabels, leadStages, type Lead } from "@/features/operations/types";
import { DataTable, EmptyState, PageHeader, StatusPill, formatDate, type Column } from "@/components/dashboard/ui";
import { FilterBar, LeadSourceNote } from "@/components/admin/admin-ui";
import { leadStageLabel, leadStageTone, param } from "@/components/admin/format";
import { staffById } from "@/server/demo/workspace";
import { getLeadDirectory } from "@/server/services/lead-directory";

export const metadata: Metadata = { title: "Leads" };

const stageOptions = [...leadStages.map((s) => ({ value: s.value, label: s.label })), { value: "lost", label: "Lost" }];

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = param(sp.q).trim();
  const stage = param(sp.stage);
  const directory = await getLeadDirectory();
  const isDemo = directory.source === "demo";

  const needle = q.toLowerCase();
  const rows = directory.leads.filter(
    (l) => (!stage || l.stage === stage) && (!needle || [l.name, l.reference, l.email, l.whatsapp, l.source].some((v) => v.toLowerCase().includes(needle))),
  );

  const columns: Column<Lead>[] = [
    { key: "name", header: "Lead", cell: (l) => l.name },
    { key: "reference", header: "Reference", cell: (l) => <span className="font-mono text-xs">{l.reference}</span>, desktopOnly: true },
    { key: "stage", header: "Stage", cell: (l) => <StatusPill tone={leadStageTone(l.stage)}>{leadStageLabel(l.stage)}</StatusPill> },
    { key: "goal", header: "Goal", cell: (l) => `${destinationLabels[l.destination]} · ${degreeLabels[l.level]} · ${l.intake}` },
    { key: "source", header: "Source", cell: (l) => l.source, desktopOnly: true },
    { key: "advisor", header: "Advisor", cell: (l) => (isDemo ? (staffById(l.advisorId)?.name ?? "Unassigned") : l.advisorId ? "Assigned" : "Unassigned") },
    { key: "follow", header: "Follow-up", cell: (l) => (l.followUpAt ? formatDate(l.followUpAt) : "—"), className: "tabular-nums whitespace-nowrap" },
    { key: "created", header: "Enquired", cell: (l) => formatDate(l.createdAt), className: "tabular-nums whitespace-nowrap", desktopOnly: true },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Leads"
        description="Every enquiry as a searchable list. Use the CRM board to see the pipeline by stage."
        actions={
          <Link href="/admin/crm" className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium text-ink ring-1 ring-border-strong ring-inset hover:bg-ink/5">
            Board view
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
          <FilterBar
            action="/admin/leads"
            search={{ value: q, placeholder: "Name, reference, email, phone" }}
            fields={[{ name: "stage", label: "Stage", value: stage, options: stageOptions }]}
            resultLabel={`${rows.length} of ${directory.leads.length} leads`}
          />
          <div className="mt-4">
            {rows.length === 0 ? (
              <EmptyState icon={SearchX} title="No leads match" description="Try a different search or clear the stage filter." />
            ) : (
              <DataTable rows={rows} columns={columns} rowKey={(l) => l.id} primary="name" caption="Leads" href={(l) => `/admin/leads/${l.id}`} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
