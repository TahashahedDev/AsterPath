import { ArrowRight, MessageCircle } from "lucide-react";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";

export function CtaSection({
  title = "Talk to us before you decide anything.",
  description = "Thirty minutes, free. Tell us your marks, budget and the intake you want. We'll tell you what's realistic in Italy, roughly what it costs, and what you would need to do first. You don't have to sign up.",
  whatsappMessage,
  className,
}: {
  title?: string;
  description?: string;
  whatsappMessage?: string;
  /** Overrides the default top spacing where the preceding section already pads. */
  className?: string;
}) {
  return (
    <section className={cn("page-container mt-28", className)}>
      <div className="reveal panel-sheen relative overflow-hidden rounded-[1.75rem] bg-inverse px-6 py-14 text-on-inverse ring-1 ring-transparent sm:px-14 sm:py-20 dark:ring-border-strong">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_100%_0%,rgb(176_141_87/0.28),transparent_70%)]" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <h2 className="display text-4xl leading-[1.08] sm:text-5xl">{title}</h2>
          <p className="mt-6 text-lg leading-relaxed text-on-inverse/75">{description}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <div className="flex sm:inline-flex">
              <ButtonLink href="/contact" size="lg" className="w-full" data-track="closing panel: consultation">
                Book a free consultation <ArrowRight aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="flex sm:inline-flex">
              <ExternalButtonLink href={whatsappUrl(whatsappMessage)} variant="secondary" size="lg" className="w-full bg-transparent text-on-inverse ring-on-inverse/25 hover:ring-on-inverse/40">
                <MessageCircle aria-hidden="true" /> WhatsApp an advisor
              </ExternalButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
