import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { QuoteBuilder } from "@/components/admin/quote-builder";
import { getLeadDirectory } from "@/server/services/lead-directory";
import { DataTable, PageHeader, Panel, StatusPill } from "@/components/dashboard/ui";
import { discountRules, instalmentPlan, passThroughCosts, pricingStatus, refundPolicy, serviceFees } from "@/content/pricing";
import { degreeLabels, type DegreeLevel } from "@/features/operations/types";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingAdminPage({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const { lead: leadId } = await searchParams;
  const directory = leadId ? await getLeadDirectory() : null;
  // Quotes save only against live leads; demo and local enquiries have nowhere to keep them.
  const lead = directory?.source === "supabase" ? directory.leads.find((l) => l.id === leadId) : undefined;
  const fees = (Object.keys(serviceFees) as DegreeLevel[]).map((level) => ({ level, ...serviceFees[level] }));
  const costs = Object.entries(passThroughCosts).map(([id, c]) => ({ id, ...c }));

  return (
    <>
      <PageHeader
        eyebrow="Revenue"
        title={
          <>
            One plan, <span className="display-italic text-primary">priced in the open.</span>
          </>
        }
        description="How every written figure is built: our service fee, plus the costs we pay on the student's behalf, minus approved discounts. Internal only: prices never appear on the public site."
        actions={
          <StatusPill tone={pricingStatus.status === "confirmed" ? "success" : "warning"}>
            {pricingStatus.status === "confirmed" ? `Confirmed by ${pricingStatus.confirmedBy}` : `Proposed ${pricingStatus.proposedOn} — founder to confirm`}
          </StatusPill>
        }
      />
      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <Lock className="size-4" aria-hidden="true" /> Figures live in <code>src/content/pricing.ts</code> . Open the builder from a lead to save a quote to it.
      </p>

      <Panel title={lead ? `Quote for ${lead.name}` : "Quote builder"} className="mt-8">
        <QuoteBuilder lead={lead ? { id: lead.id, reference: lead.reference, name: lead.name } : undefined} />
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="fees-heading">
          <h2 id="fees-heading" className="mb-3 font-semibold text-ink">Service fee by level</h2>
          <DataTable
            caption="Service fees"
            rows={fees}
            rowKey={(f) => f.level}
            primary="level"
            columns={[
              { key: "level", header: "Level", cell: (f) => degreeLabels[f.level] },
              { key: "amount", header: "Fee", cell: (f) => <span className="tabular-nums">{formatInr(f.amount)}</span> },
              { key: "why", header: "Why", cell: (f) => f.why, desktopOnly: true },
            ]}
          />
        </section>
        <section aria-labelledby="instalments-heading">
          <h2 id="instalments-heading" className="mb-3 font-semibold text-ink">Instalments</h2>
          <DataTable
            caption="Instalment plan"
            rows={[...instalmentPlan]}
            rowKey={(i) => i.stage}
            primary="stage"
            columns={[
              { key: "stage", header: "Stage", cell: (i) => i.stage },
              { key: "share", header: "Share", cell: (i) => `${i.share}%` },
              { key: "when", header: "Due", cell: (i) => i.when },
            ]}
          />
        </section>
      </div>

      <section aria-labelledby="costs-heading" className="mt-6">
        <h2 id="costs-heading" className="mb-3 font-semibold text-ink">
          Costs we pay for the student <span className="text-sm font-normal text-muted">(planning estimates — verify each against the official fee before quoting)</span>
        </h2>
        <DataTable
          caption="Pass-through costs"
          rows={costs}
          rowKey={(c) => c.id}
          primary="label"
          columns={[
            { key: "label", header: "Cost", cell: (c) => c.label },
            { key: "amount", header: "Estimate", cell: (c) => <span className="tabular-nums whitespace-nowrap">{formatInr(c.amount)}{c.unit ? ` ${c.unit}` : ""}</span> },
            { key: "basis", header: "Basis", cell: (c) => c.basis, desktopOnly: true },
          ]}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Discount rules">
          <ul className="grid gap-3 text-sm text-ink-soft">
            <li><strong className="text-ink">Early start, {discountRules.earlyStart.percent}%</strong> of the service fee for signing {discountRules.earlyStart.monthsBefore}+ months before the intake. {discountRules.earlyStart.why}</li>
            <li><strong className="text-ink">Referral credit, {formatInr(discountRules.referralCredit.amount)}</strong> for the new student, and the same for the referrer once that student enrols. {discountRules.referralCredit.why}</li>
            <li><strong className="text-ink">Anything else</strong> needs owner approval, is capped at {discountRules.maxExtraPercent}% of the service fee, and is written into the agreement.</li>
            <li>Discounts never touch the pass-through allowance.</li>
          </ul>
        </Panel>
        <Panel title="Refund policy (proposed)">
          <ul className="grid gap-2 text-sm text-ink-soft">
            {refundPolicy.map((r) => (
              <li key={r} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta" aria-hidden="true" />{r}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">The public refunds page must match this once confirmed and reviewed by a lawyer.</p>
        </Panel>
      </div>
    </>
  );
}
