import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { DemoNotice, PageHeader, Panel } from "@/components/dashboard/ui";
import { AdvisorCard } from "@/components/portal/advisor-card";
import { DisabledAction } from "@/components/portal/disabled-action";
import { PortalUnavailable } from "@/components/portal/portal-unavailable";
import { degreeLabels, destinationLabels } from "@/features/operations/types";
import { getDemoPortal } from "@/server/demo/portal";
import { isPortalDemoEnabled } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  const header = <PageHeader eyebrow="Profile" title="Your details" description="What we hold about you and your plan. Tell your advisor if anything is wrong." />;
  if (!isPortalDemoEnabled()) return <>{header}<PortalUnavailable what="profile" /></>;
  const p = getDemoPortal();
  const s = p.student;

  return (
    <div>
      {header}
      <DemoNotice />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Panel title="Personal details">
            <Facts rows={[["Name", s.name], ["Email", s.email], ["WhatsApp", s.whatsapp], ["City", s.city]]} />
          </Panel>
          <Panel title="Academic background">
            <p className="text-sm leading-relaxed text-ink-soft">{s.academicSummary}</p>
          </Panel>
          <Panel title="Your plan">
            <Facts
              rows={[
                ["Destination", destinationLabels[s.destination]],
                ["Level", degreeLabels[s.level]],
                ["Course", s.course],
                ["Intake", s.intake],
                ["Shortlist", s.shortlist.length ? s.shortlist.join(", ") : "Being prepared"],
              ]}
            />
          </Panel>
          <DisabledAction id="edit-profile" label="Edit details" reason="Editing opens once your account is connected to our database. Until then, message your advisor and they'll update your record." />
        </div>
        <aside className="space-y-6">
          <AdvisorCard advisor={p.advisor} studentFirstName={p.firstName} />
          <section aria-labelledby="privacy-heading" className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 id="privacy-heading" className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Lock className="size-4 text-primary" aria-hidden="true" /> Your privacy
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              <li>We store the details on this page, your documents and your application history — only what your study plan needs.</li>
              <li>Your advisor and our document reviewer can see your case. Finance staff see payments only, never your passport or bank records.</li>
              <li>Documents go to universities and consulates only as part of applications you have approved.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[9rem_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="-mt-2 min-w-0 break-words text-ink sm:mt-0">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
