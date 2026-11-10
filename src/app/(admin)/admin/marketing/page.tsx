import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Inbox } from "lucide-react";
import { DemoNotice, EmptyState, PageHeader, Panel, StatusPill, formatDate, type PillTone } from "@/components/dashboard/ui";
import { DemoUnavailable, LeadSourceNote, RuleList } from "@/components/admin/admin-ui";
import { isDemoWorkspaceEnabled } from "@/server/demo/workspace";
import { getLeadDirectory } from "@/server/services/lead-directory";

export const metadata: Metadata = { title: "Marketing" };

type Post = { id: string; channel: "Instagram" | "Facebook"; date: string; title: string; status: "Draft" | "In review" | "Approved" };
/** Demo drafts only: nothing here has been, or will be, published from this page. */
const demoPosts: Post[] = [
  { id: "po-1", channel: "Instagram", date: "2026-11-18", title: "Carousel: the Universitaly pre-enrolment steps, in order", status: "Approved" },
  { id: "po-2", channel: "Facebook", date: "2026-11-21", title: "Explainer: what a DOV is and when you need one", status: "In review" },
  { id: "po-3", channel: "Instagram", date: "2026-11-25", title: "Reel script: regional DSU scholarships, how ISEE parificato works", status: "Draft" },
  { id: "po-4", channel: "Instagram", date: "2026-12-02", title: "Checklist post: documents to start gathering in December", status: "Draft" },
];
const postTone: Record<Post["status"], PillTone> = { Draft: "neutral", "In review": "gold", Approved: "success" };

export default async function MarketingPage() {
  const directory = await getLeadDirectory();
  const bySource = new Map<string, number>();
  for (const l of directory.leads) bySource.set(l.source, (bySource.get(l.source) ?? 0) + 1);
  const sources = [...bySource.entries()].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...sources.map(([, n]) => n));

  return (
    <div>
      <PageHeader
        eyebrow="Growth"
        title="Marketing"
        description="Content calendar, where enquiries come from, and the rules every post must pass."
        actions={
          <Link href="/admin/ai" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-deep">
            <Bot className="size-4" aria-hidden="true" /> Draft in AI workspace
          </Link>
        }
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <Panel title="Content calendar" bodyClassName="p-0" action={isDemoWorkspaceEnabled() ? <StatusPill tone="warning">Demo</StatusPill> : undefined}>
            {isDemoWorkspaceEnabled() ? (
              <>
                <ul className="divide-y divide-border">
                  {demoPosts.map((p) => (
                    <li key={p.id} className="flex flex-col gap-1.5 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                      <span className="w-24 shrink-0 text-xs text-muted tabular-nums">{formatDate(p.date)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-ink">{p.title}</span>
                        <span className="text-xs text-muted">{p.channel}</span>
                      </span>
                      <StatusPill tone={postTone[p.status]}>{p.status}</StatusPill>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-border px-5 py-3 text-xs text-muted">Synthetic drafts. Publishing is manual: nothing is posted from this workspace.</p>
              </>
            ) : (
              <div className="p-5">
                <DemoUnavailable module="The content calendar" />
              </div>
            )}
          </Panel>
        </div>
        <div className="min-w-0 lg:col-span-2">
          <Panel title="Enquiries by source">
            {directory.source === "unavailable" ? (
              <EmptyState icon={Inbox} title="No attribution yet" description={directory.reason} />
            ) : (
              <>
                <ul className="space-y-3">
                  {sources.map(([source, n]) => (
                    <li key={source}>
                      <div className="flex justify-between text-sm">
                        <span className="text-ink">{source}</span>
                        <span className="text-muted tabular-nums">{n}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-paper-deep" aria-hidden="true">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted">Grouped by UTM source captured on each enquiry; enquiries without one count as “Website”. Campaign-level attribution follows once UTM campaigns are stored.</p>
              </>
            )}
          </Panel>
          {directory.source === "demo" ? <DemoNotice>Source counts are from demo enquiries.</DemoNotice> : <LeadSourceNote source={directory.source} />}
        </div>
      </div>
      <RuleList
        className="mt-6"
        title="Publishing rules"
        items={[
          "A named person approves every post before it is published. AI drafts are a starting point, never the final copy.",
          "No testimonials, reviews or success stories until real students have given written consent.",
          "No fabricated or composite students, and no stock photos presented as clients.",
          "No visa-success, admission or scholarship guarantees or rates. Outcomes are decided by universities and consulates.",
          "Facts about Italy link to the official source they come from.",
        ]}
      />
    </div>
  );
}
