import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, ArrowUpRight, Compass, MessagesSquare, X } from "lucide-react";
import { getUpcomingDestination, upcomingDestinations } from "@/content/destinations";
import { Flag } from "@/components/marketing/flag";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = { params: Promise<{ country: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [...upcomingDestinations.map((d) => ({ country: d.slug })), { country: "italy" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const destination = getUpcomingDestination((await params).country);
  if (!destination) return {};
  return {
    title: `Study in ${destination.name}: opening next`,
    description: `AsterPath is preparing its ${destination.name} guidance for Indian students. Join the list, or start with a free profile evaluation now.`,
    alternates: { canonical: `/destinations/${destination.slug}` },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { country } = await params;
  if (country === "italy") permanentRedirect("/study-in-italy");
  const destination = getUpcomingDestination(country);
  if (!destination) notFound();

  const contactHref = `/contact?destination=${destination.slug}`;
  const helpNow = [
    {
      icon: Compass,
      title: "A profile evaluation",
      body: `We look at your marks, subject, budget and timing, and tell you honestly whether ${destination.name} or Italy is the more realistic route for you today.`,
    },
    {
      icon: MessagesSquare,
      title: "A first conversation",
      body: `Tell us what you want from ${destination.name}. We note your plans and contact you when our ${destination.name} guidance is ready.`,
    },
  ];
  const notYet = ["Entry and language requirements", "Tuition, fees or living costs", "Application deadlines", "Visa or residence rules"];

  return (
    <>
      <section className="atmosphere relative overflow-hidden border-b border-border">
        <div className="page-container relative py-16 sm:py-24">
          <div className="max-w-3xl motion-safe:animate-rise">
            <p className="eyebrow mb-5">Destinations</p>
            <div className="flex items-center gap-3">
              <Flag code={destination.flag} className="h-7 w-10.5" label={`Flag of ${destination.name}`} />
              <Badge tone="gold">Opening next</Badge>
            </div>
            <h1 className="display mt-6 text-[2.75rem] leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
              Study in {destination.name}. <span className="display-italic text-primary">Opening next.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">{destination.summary}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={contactHref} size="lg">
                Join the {destination.name} list <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/study-in-italy" variant="secondary" size="lg">
                Explore Italy now
              </ButtonLink>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <Badge tone="warning">Guidance in preparation</Badge>
              <span className="text-muted">Nothing on this page is country guidance yet. We publish it only once it is checked against official sources.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container mt-20" aria-labelledby="help-now-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="reveal">
            <p className="eyebrow mb-5">Already available</p>
            <h2 id="help-now-title" className="display text-4xl leading-[1.06] text-ink">
              What we can already help with
            </h2>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {helpNow.map(({ icon: Icon, title, body }) => (
              <li key={title} className="reveal rounded-[var(--radius-card)] border border-border bg-card p-7">
                <Icon className="size-7 text-terracotta" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="display mt-5 text-2xl text-ink">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-container mt-24" aria-labelledby="not-yet-title">
        <div className="reveal grid gap-10 rounded-[1.75rem] border border-border bg-paper-deep/70 p-7 sm:p-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="not-yet-title" className="display text-3xl leading-[1.1] text-ink sm:text-4xl">
              What we are not publishing yet
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              Rules change, and a wrong figure costs students money and months. Until our {destination.name} guidance is verified, please rely on official
              sources.
            </p>
            <p className="mt-6 text-sm text-muted">
              Official starting point:{" "}
              <a href={destination.officialPortal.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-deep">
                {destination.officialPortal.label}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              ({destination.officialPortal.publisher})
            </p>
          </div>
          <ul className="rows self-center">
            {notYet.map((item) => (
              <li key={item} className="flex items-center gap-3 py-4 text-[1.0625rem] text-ink-soft">
                <X className="size-4 shrink-0 text-muted" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-container mt-28">
        <div className="reveal panel-sheen relative overflow-hidden rounded-[1.75rem] bg-inverse px-6 py-14 text-on-inverse sm:px-14 sm:py-20 dark:ring-1 dark:ring-border-strong">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_100%_0%,rgb(176_141_87/0.28),transparent_70%)]" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <h2 className="display text-4xl leading-[1.08] sm:text-5xl">
              Be first to hear when <span className="display-italic text-accent-on-inverse">{destination.name} opens.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-on-inverse/75">
              Leave your details and tell us it is about {destination.name}. No obligation.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={contactHref} size="lg">
                Join the list <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ExternalButtonLink
                href={whatsappUrl(`Hello AsterPath, I'm interested in studying in ${destination.name}.`)}
                variant="secondary"
                size="lg"
                className="bg-transparent text-on-inverse ring-on-inverse/25 hover:bg-on-inverse/10 hover:ring-on-inverse/40"
              >
                WhatsApp an advisor
              </ExternalButtonLink>
            </div>
            <p className="mt-8 text-sm text-on-inverse/75">
              Ready to move sooner?{" "}
              <Link href="/destinations" className="font-semibold text-accent-on-inverse underline-offset-4 hover:underline">
                See all destinations
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
