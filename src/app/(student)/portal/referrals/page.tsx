import type { Metadata } from "next";
import { Gift } from "lucide-react";
import { DemoNotice, EmptyState, PageHeader, Panel, StatusPill, formatDate, type PillTone } from "@/components/dashboard/ui";
import { CopyButton } from "@/components/portal/copy-button";
import { LivePortalReferrals, NoCaseYet } from "@/components/portal/live-case";
import { PortalUnavailable } from "@/components/portal/portal-unavailable";
import { getMyCase } from "@/server/services/cases";
import { siteConfig } from "@/config/site";
import type { Referral } from "@/features/operations/types";
import { getDemoPortal } from "@/server/demo/portal";
import { isPortalDemoEnabled } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Referrals" };

const statusLabel: Record<Referral["status"], string> = { invited: "Invited", enquired: "Enquired", converted: "Enrolled with us" };
const rewardLabel: Record<Referral["rewardStatus"], [string, PillTone]> = {
  none: ["No reward yet", "neutral"],
  pending_approval: ["Reward pending confirmation", "gold"],
  approved: ["Reward confirmed", "success"],
};

export default async function ReferralsPage() {
  const header = <PageHeader eyebrow="Referrals" title="Bring a friend to Italy" description="Share your code with friends who are thinking about studying in Italy. We'll treat them with the same care." />;
  const live = await getMyCase();
  if (live !== null) return <>{header}{live ? <LivePortalReferrals c={live} /> : <NoCaseYet />}</>;
  if (!isPortalDemoEnabled()) return <>{header}<PortalUnavailable what="referrals" /></>;
  const referrals = getDemoPortal().referrals;
  const code = referrals[0]?.code;

  return (
    <div>
      {header}
      <DemoNotice />
      {code ? (
        <div className="mt-8 space-y-6">
          <section aria-labelledby="code-heading" className="rounded-[var(--radius-card)] bg-inverse p-6 text-on-inverse shadow-[var(--shadow-lift)] sm:p-8">
            <h2 id="code-heading" className="text-xs font-semibold tracking-[0.16em] text-accent-on-inverse uppercase">
              Your referral code
            </h2>
            <p className="display mt-2 text-4xl tracking-wide break-all sm:text-5xl">{code}</p>
            <ReferralLink url={`${siteConfig.url}/contact?ref=${encodeURIComponent(code)}`} />
          </section>
          <Panel title="People you've referred" bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {referrals.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-ink">{r.referredName}</p>
                    <p className="text-xs text-muted">
                      {statusLabel[r.status]} · since {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <StatusPill tone={rewardLabel[r.rewardStatus][1]}>{rewardLabel[r.rewardStatus][0]}</StatusPill>
                </li>
              ))}
            </ul>
            <p className="border-t border-border px-5 py-3 text-xs leading-relaxed text-muted">
              Rewards are confirmed by AsterPath after the referred student enrols; terms are shared in writing.
            </p>
          </Panel>
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState icon={Gift} title="No referral code yet" description="Your advisor can issue one once your plan is active." />
        </div>
      )}
    </div>
  );
}

function ReferralLink({ url }: { url: string }) {
  return (
    <div className="mt-6">
      <p className="text-sm text-on-inverse/75" id="ref-link-label">
        Or share this link
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <p aria-labelledby="ref-link-label" className="min-w-0 flex-1 rounded-xl bg-on-inverse/10 px-4 py-3 font-mono text-sm break-all select-all">
          {url}
        </p>
        <div className="flex flex-col gap-1 [&_button]:bg-card">
          <CopyButton value={url} label="Copy link" />
        </div>
      </div>
    </div>
  );
}
