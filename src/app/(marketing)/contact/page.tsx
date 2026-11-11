import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/config/site";
import { upcomingIntakes } from "@/features/leads/intakes";
import { BookingEmbed } from "@/components/booking/booking-embed";
import { EnquiryForm, PrefilledEnquiryForm } from "@/components/forms/enquiry-form";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Book a free consultation: study in Italy",
  description: "Book a free 30-minute consultation about studying in Italy, or send your details and an AsterPath advisor will reply within one working day.",
  alternates: { canonical: "/contact" },
};

// Intake options are date-based; regenerate the page daily so they stay current.
export const revalidate = 86400;

const nextSteps = [
  "An advisor reads your details before the call.",
  "Thirty minutes: your profile, your options and the timeline.",
  "A written figure for your plan, with no obligation.",
];

const quickMessages = [
  { label: "Master's in Italy", message: "Hello AsterPath, I'd like to discuss a master's degree in Italy." },
  { label: "Bachelor's in Italy", message: "Hello AsterPath, I'd like to discuss a bachelor's degree in Italy." },
  { label: "Scholarships (DSU)", message: "Hello AsterPath, I'd like to know about regional (DSU) scholarships in Italy." },
  { label: "Documents and DOV", message: "Hello AsterPath, I have a question about document attestation and the Declaration of Value." },
  { label: "Germany or France", message: "Hello AsterPath, I'm interested in studying in Germany or France. Please add me to the list." },
];

export default function ContactPage() {
  const intakes = upcomingIntakes();
  return (
    <>
      <section className="section-s">
        <div className="page-container cols items-end gap-y-8">
          <div className="col-span-7">
            <h1 className="max-w-[14ch]">Book a free consultation</h1>
            <p className="lead mt-6 text-ink-2">Thirty minutes with an advisor. Pick a time or write first.</p>
          </div>
          <ol className="rows col-span-5">
            {nextSteps.map((step, i) => (
              <li key={step} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-3">
                <span className="figure-xl text-xl text-accent">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="book" className="scroll-mt-24 pb-[var(--section-gap-s)]" aria-label="Choose a time">
        <div className="page-container">
          <BookingEmbed />
        </div>
      </section>

      <section className="section band-moss" aria-labelledby="write-title">
        <div className="page-container cols gap-y-10">
          <div className="col-span-4">
            <h2 id="write-title">Prefer to write first?</h2>
            <p className="lead mt-5 text-ink-2">Four short steps, about three minutes.</p>
            <div className="mt-8 space-y-2 text-[0.9375rem]">
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="link block">
                WhatsApp {siteConfig.whatsapp.display}
              </a>
              {siteConfig.contactEmailLive && (
                <a href={`mailto:${siteConfig.contactEmail}`} className="link block">
                  {siteConfig.contactEmail}
                </a>
              )}
            </div>
            <div className="mt-8">
              <p className="text-sm font-semibold text-ink">Or start a WhatsApp chat about:</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {quickMessages.map((q) => (
                  <li key={q.label}>
                    <a
                      href={whatsappUrl(q.message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center rounded-full bg-card px-4 text-sm text-ink ring-1 ring-border transition-colors hover:ring-primary"
                    >
                      {q.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-8 max-w-[38ch] text-sm leading-relaxed text-muted">
              Please do not share passports, bank statements or other documents here. When documents are needed, we give you a secure, private way to share them.
            </p>
          </div>
          <div id="enquiry" className="col-span-8 scroll-mt-24">
            <Suspense fallback={<EnquiryForm intakes={intakes} />}>
              <PrefilledEnquiryForm intakes={intakes} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
