import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { upcomingIntakes } from "@/features/leads/intakes";
import { EnquiryForm, PrefilledEnquiryForm } from "@/components/forms/enquiry-form";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Book a free consultation — study in Italy",
  description: "Tell us about your plans for Italy. An AsterPath advisor will contact you to arrange a free consultation.",
  alternates: { canonical: "/contact" },
};

// Intake options are date-based; regenerate the page daily so they stay current.
export const revalidate = 86400;

const nextSteps = [
  "An advisor reads your enquiry personally.",
  "We contact you by your preferred method to arrange a first conversation.",
  "You get honest first thoughts on your options — with no obligation.",
];

export default function ContactPage() {
  const intakes = upcomingIntakes();
  return (
    <section className="atmosphere relative">
            {/* Phones: intro → form → details. Desktop: intro and details on the left, form on the right. */}
      <div className="page-container relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.35fr] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10">
        <div className="motion-safe:animate-rise lg:col-start-1 lg:row-start-1">
          <p className="eyebrow mb-4">Free consultation</p>
          <h1 className="display text-[2.75rem] leading-[1.02] sm:text-6xl">
            Let&rsquo;s start with <span className="display-italic text-primary">where you are.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Four short steps, about three minutes. We only ask what we need for a useful first conversation.
          </p>
        </div>

        <div className="motion-safe:animate-rise motion-safe:[animation-delay:120ms] lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Suspense fallback={<EnquiryForm intakes={intakes} />}>
            <PrefilledEnquiryForm intakes={intakes} />
          </Suspense>
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <ol className="space-y-4">
            {nextSteps.map((item, index) => (
              <li key={item} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-medium text-primary-deep tabular-nums">{index + 1}</span>
                <span className="pt-0.5 text-ink-soft">{item}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-3">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
              <MessageCircle className="size-5 text-primary" aria-hidden="true" />
              <span>
                <span className="block font-medium">Prefer to chat?</span>
                <span className="block text-sm text-muted">WhatsApp {siteConfig.whatsapp.display}</span>
              </span>
            </a>
            <a href={`mailto:${siteConfig.contactEmail}`} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
              <Mail className="size-5 text-primary" aria-hidden="true" />
              <span>
                <span className="block font-medium">Email</span>
                <span className="block text-sm text-muted">{siteConfig.contactEmail}</span>
              </span>
            </a>
          </div>

          <p className="mt-8 flex gap-3 text-sm leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            Please don&rsquo;t share passports, bank statements or other documents here. When documents are needed, we&rsquo;ll provide a secure, private way to share them.
          </p>
        </div>
      </div>
    </section>
  );
}
