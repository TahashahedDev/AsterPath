import type { Metadata } from "next";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { PageHeader, Panel, StatusPill } from "@/components/dashboard/ui";
import { Facts, TextLink } from "@/components/admin/admin-ui";
import { legalEntity, siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Settings" };

const legalFields: { key: Exclude<keyof typeof legalEntity, "confirmed">; label: string }[] = [
  { key: "registeredName", label: "Registered name" },
  { key: "entityType", label: "Entity type" },
  { key: "registeredAddress", label: "Registered address" },
  { key: "gstin", label: "GSTIN" },
  { key: "grievanceOfficer", label: "Grievance officer" },
  { key: "grievanceEmail", label: "Grievance email" },
  { key: "governingCity", label: "Jurisdiction" },
];

const security: { label: string; done: boolean; note: string }[] = [
  { label: "Multi-factor authentication for owners, administrators and document reviewers", done: false, note: "Required before any real student data is stored." },
  { label: "Row Level Security on every table holding personal data", done: false, note: "Policies exist for profiles, enquiries and the team; casework tables follow." },
  { label: "Private document storage with signed URLs", done: false, note: "No real documents are accepted until this ships." },
  { label: "Append-only audit log", done: true, note: "Changes to profiles, enquiries, team and permissions are recorded." },
  { label: "Least-privilege roles (finance and marketing cannot open sensitive documents)", done: false, note: "Enforced in the database, not only in the interface." },
];

const isPlaceholder = (v: string) => v.startsWith("[");

export default function SettingsPage() {
  return (
    <div>
      <PageHeader eyebrow="Administration" title="Settings" description="Organisation settings, read-only for now. They become editable once site settings move into the database." />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel title="Organisation" className="min-w-0">
          <Facts
            items={[
              { label: "Name", value: siteConfig.name },
              { label: "Site URL", value: <span className="break-all">{siteConfig.url}</span> },
              { label: "Contact email", value: siteConfig.contactEmail },
              { label: "WhatsApp", value: <span className="tabular-nums">{siteConfig.whatsapp.display}</span> },
            ]}
          />
          <p className="mt-4 text-xs text-muted">Set through NEXT_PUBLIC_* environment variables on the deployment.</p>
        </Panel>
        <Panel title="Legal entity" className="min-w-0" action={legalEntity.confirmed ? <StatusPill tone="success">Confirmed</StatusPill> : <StatusPill tone="warning">Needs founder input</StatusPill>}>
          <Facts
            items={legalFields.map((f) => ({
              label: f.label,
              value: isPlaceholder(legalEntity[f.key]) ? <span className="text-terracotta-deep">Needs founder input</span> : legalEntity[f.key],
            }))}
          />
        </Panel>
      </div>
      <Panel title="Security checklist" className="mt-4" bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {security.map((s) => (
            <li key={s.label} className="flex gap-3 px-5 py-3.5">
              {s.done ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-label="Done" role="img" /> : <CircleDashed className="mt-0.5 size-4 shrink-0 text-terracotta-deep" aria-label="Not done" role="img" />}
              <span className="min-w-0">
                <span className="block text-sm text-ink">{s.label}</span>
                <span className="block text-xs text-muted">{s.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <TextLink href="/admin/integrations">Integrations</TextLink>
        <TextLink href="/admin/team">Team and roles</TextLink>
        <TextLink href="/admin/audit">Audit log</TextLink>
      </div>
    </div>
  );
}
