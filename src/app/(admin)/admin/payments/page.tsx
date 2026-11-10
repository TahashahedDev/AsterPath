import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { DemoNotice, PageHeader, Panel, StatCard, StatusPill, formatDate } from "@/components/dashboard/ui";
import { DemoUnavailable } from "@/components/admin/admin-ui";
import { InstalmentList } from "@/components/admin/live-casework";
import { listInstalments } from "@/server/services/cases";
import { instalmentLabels, instalmentTone } from "@/components/admin/format";
import { paymentTotals } from "@/components/admin/workspace-data";
import { demoInvoices, isDemoWorkspaceEnabled, studentById } from "@/server/demo/workspace";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Payments" };

const structure = [
  { title: "Packages", body: "The one published plan and its milestone split. Defined in the agreement template; not editable here yet." },
  { title: "Custom quotes", body: "Scope-specific quotes for unusual cases. Each needs founder approval before it is sent." },
  { title: "Discounts", body: "Referral or hardship discounts, each with a recorded reason and approver." },
  { title: "Refunds", body: "Refunds follow the written refund policy and are recorded against the original instalment, never netted silently." },
];

export default async function PaymentsPage() {
  const header = <PageHeader eyebrow="Revenue" title="Payments" description="Invoices, milestone instalments and what is outstanding. Prices here are internal and never shown to other students." />;
  const razorpay = (
    <p role="status" className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-ink-soft">
      <CreditCard className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden="true" />
      <span>
        <strong className="font-semibold text-ink">Razorpay: not configured.</strong> Payments are recorded manually; there is no online collection. See{" "}
        <Link href="/admin/integrations" className="font-medium text-primary underline-offset-4 hover:underline">Integrations</Link>.
      </span>
    </p>
  );
  const ledger = await listInstalments();
  if (ledger) {
    const open = ledger.filter((i) => i.status === "due" || i.status === "upcoming");
    const collected = ledger.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    const due = ledger.filter((i) => i.status === "due").reduce((s, i) => s + i.amount, 0);
    return (
      <div>
        {header}
        {razorpay}
        <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
          <StatCard label="Collected" value={<span className="text-2xl sm:text-3xl">{formatInr(collected)}</span>} hint="Confirmed against the bank record" />
          <StatCard label="Requested, not yet paid" value={<span className="text-2xl sm:text-3xl">{formatInr(due)}</span>} />
        </div>
        <Panel title="Open instalments" className="mt-6">
          {ledger.length === 0 ? (
            <p className="text-sm text-muted">Nothing here. Instalments appear when a case is opened, and only finance, admins and owners can see them.</p>
          ) : open.length === 0 ? (
            <p className="text-sm text-muted">Everything is paid or waived.</p>
          ) : (
            <InstalmentList rows={open} showStudent />
          )}
        </Panel>
        <p className="mt-4 text-sm text-muted">Confirm a payment only after checking the money against the bank statement or Razorpay record, never a screenshot.</p>
      </div>
    );
  }
  if (!isDemoWorkspaceEnabled()) return <div>{header}{razorpay}<DemoUnavailable module="Payments" /></div>;

  const t = paymentTotals();
  return (
    <div>
      {header}
      <DemoNotice>Every invoice and amount below is synthetic. No payment has been taken and none is marked paid without a recorded receipt.</DemoNotice>
      {razorpay}
      <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Collected" value={<span className="text-2xl sm:text-3xl">{formatInr(t.collected)}</span>} hint="Paid instalments with a receipt" />
        <StatCard label="Due now" value={<span className="text-2xl sm:text-3xl">{formatInr(t.pendingTotal - t.overdueTotal)}</span>} hint="Due, not yet overdue" />
        <StatCard label="Overdue" value={<span className="text-2xl sm:text-3xl">{formatInr(t.overdueTotal)}</span>} tone="attention" hint={`${t.overdue.length} instalment${t.overdue.length === 1 ? "" : "s"}`} />
        <StatCard label="Outstanding balance" value={<span className="text-2xl sm:text-3xl">{formatInr(t.outstandingTotal)}</span>} hint="Everything not yet paid" />
      </div>

      <div className="mt-6 space-y-4">
        {demoInvoices.map((inv) => {
          const paid = inv.instalments.filter((i) => i.status === "paid").reduce((n, i) => n + i.amountInr, 0);
          const student = studentById(inv.studentId);
          return (
            <Panel
              key={inv.id}
              bodyClassName="p-0"
              title={
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-mono text-sm">{inv.number}</span>
                  <Link href={`/admin/students/${inv.studentId}`} className="text-sm font-normal text-ink-soft underline-offset-4 hover:text-primary hover:underline">{student?.name}</Link>
                </span>
              }
              action={<span className="text-xs text-muted tabular-nums">{formatInr(paid)} of {formatInr(inv.totalInr)} paid</span>}
            >
              <div className="h-1.5 bg-paper-deep" aria-hidden="true">
                <div className="h-full bg-primary" style={{ width: `${Math.round((paid / inv.totalInr) * 100)}%` }} />
              </div>
              <ul className="divide-y divide-border">
                {inv.instalments.map((i) => (
                  <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_8rem_7rem_9rem_6rem]">
                    <span className="font-medium text-ink">{i.label}</span>
                    <span className="text-right tabular-nums sm:order-3">{formatInr(i.amountInr)}</span>
                    <span className="text-xs text-muted tabular-nums sm:order-2">Due {formatDate(i.dueAt)}</span>
                    <span className="text-right text-xs text-muted sm:order-4 sm:text-left">{i.paidAt ? `Paid ${formatDate(i.paidAt)}` : "—"}{i.receipt ? ` · ${i.receipt}` : ""}</span>
                    <span className="sm:order-5 sm:text-right"><StatusPill tone={instalmentTone[i.status]}>{instalmentLabels[i.status]}</StatusPill></span>
                  </li>
                ))}
              </ul>
            </Panel>
          );
        })}
      </div>

      <h2 className="mt-10 text-sm font-semibold text-ink">Pricing structure</h2>
      <p className="mt-1 text-sm text-muted">Placeholders for the billing modules that ship with the finance release. Nothing here changes an amount.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {structure.map((s) => (
          <div key={s.title} className="rounded-xl border border-dashed border-border-strong bg-card/60 p-4">
            <h3 className="text-sm font-semibold text-ink">{s.title}</h3>
            <p className="mt-1 text-sm text-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
