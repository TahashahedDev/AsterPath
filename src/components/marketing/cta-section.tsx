import { ArrowRight, MessageCircle } from "lucide-react";
import { AsterMark } from "@/components/layout/logo";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";

export function CtaSection({
  title = "Start with a free, honest consultation.",
  description = "Tell us where you are. We'll tell you what's realistic in Italy, what it costs and what happens next — with no obligation to sign up.",
  whatsappMessage,
}: {
  title?: string;
  description?: string;
  whatsappMessage?: string;
}) {
  return (
    <section className="page-container mt-28">
      <div className="reveal panel-sheen relative overflow-hidden rounded-[1.75rem] bg-inverse px-6 py-14 text-on-inverse ring-1 ring-transparent sm:px-14 sm:py-20 dark:ring-border-strong">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_100%_0%,rgb(176_141_87/0.28),transparent_70%)]" aria-hidden="true" />
        <AsterMark className="pointer-events-none absolute -top-16 -right-16 size-72 opacity-[0.08] sm:size-96" />
        <div className="relative max-w-2xl">
          <h2 className="display text-4xl leading-[1.08] sm:text-5xl">{title}</h2>
          <p className="mt-6 text-lg leading-relaxed text-on-inverse/75">{description}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg">
              Book a free consultation <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ExternalButtonLink href={whatsappUrl(whatsappMessage)} variant="secondary" size="lg" className="bg-transparent text-on-inverse ring-on-inverse/25 hover:bg-on-inverse/10 hover:ring-on-inverse/40">
              <MessageCircle aria-hidden="true" /> WhatsApp an advisor
            </ExternalButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
