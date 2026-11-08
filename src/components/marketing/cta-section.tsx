import { ArrowRight, MessageCircle } from "lucide-react";
import { AsterMark } from "@/components/layout/logo";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";

export function CtaSection({
  title = "Start with a free, honest conversation.",
  description = "Tell us where you are and where you'd like to go. We'll tell you what's realistic, what it costs and what happens next — with no obligation to sign up.",
  whatsappMessage,
}: {
  title?: string;
  description?: string;
  whatsappMessage?: string;
}) {
  return (
    <section className="page-container mt-24">
      <div className="reveal relative overflow-hidden rounded-[1.5rem] bg-inverse px-6 py-14 text-on-inverse ring-1 ring-transparent sm:px-12 sm:py-20 dark:ring-border-strong">
        <AsterMark className="pointer-events-none absolute -top-16 -right-16 size-72 opacity-[0.07] sm:size-96" />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">{title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-on-inverse/70">{description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg">
              Build my study plan <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ExternalButtonLink href={whatsappUrl(whatsappMessage)} variant="secondary" size="lg" className="bg-transparent text-on-inverse ring-on-inverse/25 hover:bg-on-inverse/10 hover:ring-on-inverse/40">
              <MessageCircle aria-hidden="true" /> Talk to an advisor
            </ExternalButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
