import type { Metadata } from "next";
import { CalendarDays, Mail, MessageCircle } from "lucide-react";
import { DemoNotice, PageHeader, Panel } from "@/components/dashboard/ui";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { commitments, siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { getDemoPortal } from "@/server/demo/portal";
import { isPortalDemoEnabled } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Support" };

const faqs = [
  { q: "How do I send my documents safely?", a: "Use the Documents page once secure uploads open. Until then, never send passports or bank statements over email or WhatsApp — your advisor will tell you what to share and how." },
  { q: "Who decides my admission and visa?", a: "The university decides admission. The Italian consulate decides the visa. We prepare everything with you, but we never promise an outcome." },
  { q: "A deadline is close and I'm stuck.", a: "Message your advisor on WhatsApp with the word “urgent” and the deadline date. We prioritise anything due within seven days." },
  { q: "How do payments work?", a: "You pay per milestone in your written agreement. Only pay using details your advisor shares directly — we will never ask you to pay a personal account." },
];

export default function SupportPage() {
  const email = siteConfig.contactEmail;
  const emailLive = !email.endsWith(".example");
  const days = commitments.responseTimeWorkingDays;
  const firstName = isPortalDemoEnabled() ? getDemoPortal().firstName : null;
  const waMessage = `Hello AsterPath, this is ${firstName ?? "a student"} from the student portal. I need help with: `;

  return (
    <div>
      <PageHeader eyebrow="Support" title="We're here to help" description={`We reply within ${days} working day${days === 1 ? "" : "s"}, and update you ${commitments.activeStageUpdateCadence} while a stage is active.`} />
      {firstName && <DemoNotice>The greeting in the WhatsApp message uses the demo student&rsquo;s name. Contact details are real.</DemoNotice>}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Panel title="WhatsApp" action={<MessageCircle className="size-4 text-primary" aria-hidden="true" />}>
          <p className="text-sm text-muted">Fastest for quick questions. {siteConfig.whatsapp.display}</p>
          <ExternalButtonLink href={whatsappUrl(waMessage)} className="mt-4 w-full">
            Open WhatsApp
          </ExternalButtonLink>
        </Panel>
        <Panel title="Email" action={<Mail className="size-4 text-subtle" aria-hidden="true" />}>
          {emailLive ? (
            <>
              <p className="text-sm break-all text-muted">{email}</p>
              <a href={`mailto:${email}`} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-card font-medium text-ink ring-1 ring-border-strong hover:ring-ink/30">
                Write an email
              </a>
            </>
          ) : (
            <p className="text-sm text-muted">Email support address coming soon. Please use WhatsApp for now.</p>
          )}
        </Panel>
        <Panel title="Book a call" action={<CalendarDays className="size-4 text-subtle" aria-hidden="true" />}>
          <p className="text-sm text-muted">A video call with your advisor for longer conversations.</p>
          <ButtonLink href="/contact" variant="secondary" className="mt-4 w-full">
            Book a call
          </ButtonLink>
        </Panel>
      </div>

      <section aria-labelledby="faq-heading" className="mt-10">
        <h2 id="faq-heading" className="display text-2xl text-ink">
          Quick help
        </h2>
        <div className="mt-4 divide-y divide-border rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-12 cursor-pointer items-center px-5 py-3 font-medium text-ink select-none">{f.q}</summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
