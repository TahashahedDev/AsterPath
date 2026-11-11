import type { Metadata } from "next";
import Link from "next/link";
import type { Referral } from "@/features/operations/types";
import { DataTable, DemoNotice, PageHeader, StatusPill, formatDate, type Column, type PillTone } from "@/components/dashboard/ui";
import { DemoUnavailable, DisabledActions, RuleList } from "@/components/admin/admin-ui";
import { demoReferrals, isDemoWorkspaceEnabled, studentById } from "@/server/demo/workspace";
import { LiveReferrals } from "@/components/admin/live-lists";
import { listReferrals } from "@/server/services/cases";

export const metadata: Metadata = { title: "Referrals" };

const statusMeta: Record<Referral["status"], { label: string; tone: PillTone }> = {
  invited: { label: "Invited", tone: "neutral" },
  enquired: { label: "Enquired", tone: "primary" },
  converted: { label: "Converted", tone: "success" },
};
const rewardMeta: Record<Referral["rewardStatus"], { label: string; tone: PillTone }> = {
  none: { label: "No reward yet", tone: "neutral" },
  pending_approval: { label: "Needs approval", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
};

const columns: Column<Referral>[] = [
  { key: "referred", header: "Referred person", cell: (r) => r.referredName },
  { key: "code", header: "Code", cell: (r) => <span className="font-mono text-xs">{r.code}</span> },
  {
    key: "referrer",
    header: "Referred by",
    cell: (r) => (
      <Link href={`/admin/students/${r.referrerStudentId}`} className="underline-offset-4 hover:text-primary hover:underline">
        {studentById(r.referrerStudentId)?.name ?? "—"}
      </Link>
    ),
  },
  { key: "status", header: "Status", cell: (r) => <StatusPill tone={statusMeta[r.status].tone}>{statusMeta[r.status].label}</StatusPill> },
  { key: "reward", header: "Reward", cell: (r) => <StatusPill tone={rewardMeta[r.rewardStatus].tone}>{rewardMeta[r.rewardStatus].label}</StatusPill> },
  { key: "created", header: "Since", cell: (r) => formatDate(r.createdAt), className: "whitespace-nowrap tabular-nums" },
];

export default async function ReferralsPage() {
  const header = <PageHeader eyebrow="Growth" title="Referrals" description="Who referred whom, how far each referral got, and rewards waiting for approval." />;
  const live = await listReferrals();
  if (live) return <div>{header}<LiveReferrals rows={live} /></div>;
  if (!isDemoWorkspaceEnabled()) return <div>{header}<DemoUnavailable module="Referrals" /></div>;

  const codes = [...new Set(demoReferrals.map((r) => r.code))];
  const pending = demoReferrals.filter((r) => r.rewardStatus === "pending_approval");

  return (
    <div>
      {header}
      <DemoNotice />
      <div className="mt-6 flex flex-wrap gap-2" aria-label="Active referral codes">
        {codes.map((c) => (
          <span key={c} className="rounded-lg bg-card px-3 py-2 font-mono text-sm ring-1 ring-border ring-inset">
            {c} <span className="ml-1 text-muted tabular-nums">· {demoReferrals.filter((r) => r.code === c).length} referred</span>
          </span>
        ))}
      </div>
      <div className="mt-4">
        <DataTable rows={demoReferrals} columns={columns} rowKey={(r) => r.id} primary="referred" caption="Referrals" />
      </div>
      <section aria-labelledby="rewards" className="mt-8 rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 id="rewards" className="text-[0.9375rem] font-semibold text-ink">Rewards needing approval</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {pending.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2">
              <span className="text-ink">{studentById(r.referrerStudentId)?.name}</span>
              <span className="text-muted">for referring {r.referredName}</span>
            </li>
          ))}
          {pending.length === 0 && <li className="text-muted">Nothing waiting.</li>}
        </ul>
        <div className="mt-4">
          <DisabledActions id="reward-locked" actions={["Approve reward", "Decline"]} reason="Approvals are recorded once the referrals table and audit trail ship." />
        </div>
      </section>
      <RuleList className="mt-4" title="Proposed referral rules — need founder confirmation" items={["A reward becomes due only once the referred student has signed and paid; the exact trigger is set in the referral terms.", "Referrers never see the referred person's case details.", "Every approval is made by the founder or finance and is audited."]} />
    </div>
  );
}
