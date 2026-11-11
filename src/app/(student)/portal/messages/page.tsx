import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { DemoNotice, PageHeader, formatDateTime } from "@/components/dashboard/ui";
import { AdvisorCard } from "@/components/portal/advisor-card";
import { LivePortalMessages, NoCaseYet } from "@/components/portal/live-case";
import { PortalUnavailable } from "@/components/portal/portal-unavailable";
import { getMyCase } from "@/server/services/cases";
import { ExternalButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";
import { getDemoPortal } from "@/server/demo/portal";
import { isPortalDemoEnabled } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const header = <PageHeader eyebrow="Messages" title="Conversation with your advisor" description="One thread, kept with your case so nothing gets lost between calls." />;
  const live = await getMyCase();
  if (live !== null) return <>{header}{live ? <LivePortalMessages c={live} /> : <NoCaseYet />}</>;
  if (!isPortalDemoEnabled()) return <>{header}<PortalUnavailable what="messages" /></>;
  const p = getDemoPortal();

  return (
    <div>
      {header}
      <DemoNotice />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="thread-heading" className="rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]">
          <h2 id="thread-heading" className="border-b border-border px-5 py-4 text-[0.9375rem] font-semibold text-ink">
            Thread with {p.advisor?.name ?? "your advisor"}
          </h2>
          <ol className="space-y-4 p-5">
            {p.messages.map((m) => {
              const mine = m.from === "student";
              return (
                <li key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                  <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed", mine ? "rounded-br-md bg-primary text-on-primary" : "rounded-bl-md bg-paper-deep text-ink")}>
                    {m.body}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {mine ? "You" : m.authorName} · <time dateTime={m.at}>{formatDateTime(m.at)}</time>
                  </p>
                </li>
              );
            })}
          </ol>
          <div role="group" aria-label="Send a message" className="border-t border-border p-5">
            <label htmlFor="composer" className="text-sm font-medium text-ink">
              Your message
            </label>
            <textarea id="composer" disabled aria-describedby="composer-reason" rows={3} placeholder="Messaging opens soon" className="mt-2 w-full resize-none rounded-xl border border-border bg-paper px-4 py-3 text-base text-ink placeholder:text-subtle disabled:cursor-not-allowed disabled:opacity-60" />
            <p id="composer-reason" className="mt-2 text-xs leading-relaxed text-muted">
              In-portal messaging goes live once your case is connected to our database. Until then, message your advisor on WhatsApp — please don&rsquo;t send passports or bank statements there.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-[0.9375rem] font-medium text-on-primary disabled:opacity-50">
                Send
              </button>
              <ExternalButtonLink href={whatsappUrl(`Hello, this is ${p.firstName} from the AsterPath student portal.`)} variant="secondary">
                <MessageCircle aria-hidden="true" /> Use WhatsApp instead
              </ExternalButtonLink>
            </div>
          </div>
        </section>
        <aside>
          <AdvisorCard advisor={p.advisor} studentFirstName={p.firstName} />
        </aside>
      </div>
    </div>
  );
}
