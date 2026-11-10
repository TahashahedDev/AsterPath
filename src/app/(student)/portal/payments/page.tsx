import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { DemoNotice, PageHeader, Panel, StatusPill, formatDate } from "@/components/dashboard/ui";
import { DisabledAction } from "@/components/portal/disabled-action";
import { LivePayments, NoCaseYet } from "@/components/portal/live-case";
import { PortalUnavailable } from "@/components/portal/portal-unavailable";
import { getMyCase } from "@/server/services/cases";
import { instalmentLabels, instalmentTone } from "@/components/portal/tones";
import { formatInr } from "@/lib/utils";
import { getDemoPortal } from "@/server/demo/portal";
import { isPortalDemoEnabled } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const header = <PageHeader eyebrow="Payments" title="Your plan and payments" description="Milestone payments from your written agreement. You only pay for a stage when we reach it." />;
  const live = await getMyCase();
  if (live !== null) return <>{header}{live ? <LivePayments c={live} /> : <NoCaseYet />}</>;
  if (!isPortalDemoEnabled()) return <>{header}<PortalUnavailable what="payments" /></>;
  const invoices = getDemoPortal().invoices;

  return (
    <div>
      {header}
      <DemoNotice />
      <div className="mt-8 space-y-8">
        {invoices.map((inv) => {
          const paid = inv.instalments.filter((i) => i.status === "paid");
          const paidTotal = paid.reduce((s, i) => s + i.amountInr, 0);
          const owing = inv.instalments.filter((i) => i.status === "due" || i.status === "overdue");
          const owingTotal = owing.reduce((s, i) => s + i.amountInr, 0);
          return (
            <div key={inv.id} className="space-y-6">
              <section aria-labelledby={`bal-${inv.id}`} className="rounded-[var(--radius-card)] bg-inverse p-6 text-on-inverse shadow-[var(--shadow-lift)] sm:p-8">
                <p className="text-xs font-semibold tracking-[0.16em] text-accent-on-inverse uppercase">Due now</p>
                <h2 id={`bal-${inv.id}`} className="display mt-2 text-4xl tabular-nums sm:text-5xl">
                  {formatInr(owingTotal)}
                </h2>
                <p className="mt-2 text-sm text-on-inverse/75">
                  {owing.length ? owing.map((i) => `${i.label} · due ${formatDate(i.dueAt)}`).join(" · ") : "Nothing is due right now."}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-on-inverse/15 pt-5 text-sm">
                  <div>
                    <dt className="text-on-inverse/65">Paid so far</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">{formatInr(paidTotal)}</dd>
                  </div>
                  <div>
                    <dt className="text-on-inverse/65">Plan total</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">{formatInr(inv.totalInr)}</dd>
                  </div>
                </dl>
                <div className="mt-6 [&_p]:text-on-inverse/75">
                  <DisabledAction id={`pay-${inv.id}`} label="Pay now" variant="primary" reason="Online payment isn't switched on yet. Your advisor will share verified payment details." />
                </div>
              </section>

              <Panel title={`Instalment schedule · ${inv.number}`} bodyClassName="p-0">
                <p className="border-b border-border px-5 py-3 text-xs text-muted">Issued {formatDate(inv.issuedAt)}</p>
                <ol className="divide-y divide-border">
                  {inv.instalments.map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-3 px-5 py-4">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{i.label}</p>
                        <p className="text-xs text-muted">Due {formatDate(i.dueAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-medium text-ink tabular-nums">{formatInr(i.amountInr)}</span>
                        <StatusPill tone={instalmentTone[i.status]}>{instalmentLabels[i.status]}</StatusPill>
                      </div>
                    </li>
                  ))}
                </ol>
              </Panel>

              <Panel title="Payment history" action={<Receipt className="size-4 text-subtle" aria-hidden="true" />} bodyClassName="p-0">
                {paid.length ? (
                  <ul className="divide-y divide-border">
                    {paid.map((i) => (
                      <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm">
                        <div>
                          <p className="font-medium text-ink">{i.label}</p>
                          <p className="text-xs text-muted">
                            Paid {i.paidAt ? formatDate(i.paidAt) : "—"} · Receipt {i.receipt ?? "pending"}
                          </p>
                        </div>
                        <span className="font-medium tabular-nums text-ink">{formatInr(i.amountInr)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-4 text-sm text-muted">No payments recorded yet.</p>
                )}
                <p className="border-t border-border px-5 py-3 text-xs text-muted">A payment shows here only after our finance team has verified it.</p>
              </Panel>
            </div>
          );
        })}
      </div>
    </div>
  );
}
