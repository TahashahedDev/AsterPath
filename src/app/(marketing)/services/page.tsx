import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Landmark, Scale } from "lucide-react";
import { authorisedBodies, servicePhases, servicesByPhase, type Service } from "@/content/services";
import { sources } from "@/content/italy/sources";
import { CheckList, ReviewStatus } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Services: what we do, what you do, who decides",
  description:
    "AsterPath's services for Indian students, from profile evaluation and university selection to visa preparation and arrival, with who decides each step.",
  alternates: { canonical: "/services" },
};

function ServiceCard({ service }: { service: Service }) {
  const srcs = service.sources ?? [];
  return (
    <li id={service.slug} className="reveal scroll-mt-28 rounded-[var(--radius-card)] border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        {service.destination === "italy" && <Badge tone="gold">Italy</Badge>}
        {service.onRequest && <Badge tone="neutral">On request</Badge>}
      </div>
      <h3 className="display mt-3 text-2xl text-ink sm:text-[1.75rem]">{service.title}</h3>
      <p className="mt-2 max-w-[60ch] leading-relaxed text-muted">{service.summary}</p>
      <div className="mt-7 grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">What we do</p>
          <CheckList items={service.weDo} className="mt-4" />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">What you do</p>
          <CheckList items={service.youDo} className="mt-4" />
        </div>
      </div>
      <dl className="mt-7 grid gap-4 rounded-2xl bg-paper-deep/70 p-5 text-[0.9375rem] sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-2 font-semibold text-ink">
            <Scale className="size-4 text-primary" aria-hidden="true" /> Who decides
          </dt>
          <dd className="mt-1 leading-relaxed text-ink-soft">{service.decidedBy}</dd>
        </div>
        {service.authorisedBody && (
          <div>
            <dt className="flex items-center gap-2 font-semibold text-ink">
              <Landmark className="size-4 text-primary" aria-hidden="true" /> Issued by
            </dt>
            <dd className="mt-1 leading-relaxed text-ink-soft">{service.authorisedBody}</dd>
          </div>
        )}
      </dl>
      {srcs.length > 0 && (
        <p className="mt-5 text-sm text-muted">
          Official source:{" "}
          {srcs.map((id, i) => (
            <span key={id}>
              <a href={sources[id].url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:text-primary-deep">
                {sources[id].label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              {i < srcs.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      )}
    </li>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Our services, <span className="display-italic text-primary">stage by stage.</span>
          </>
        }
        description="Each service says what AsterPath does, what you do yourself, and who actually decides. Universities, consulates and authorised offices make the decisions. We make sure you reach them prepared."
      >
        <nav aria-label="Jump to a phase" className="flex flex-wrap gap-2">
          {servicePhases.map((p) => (
            <a
              key={p.id}
              href={`#phase-${p.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-ink ring-1 ring-border transition-shadow hover:ring-border-strong"
            >
              <span className="display text-lg text-terracotta">{p.number}</span>
              {p.title} {p.accent.replace(".", "")}
            </a>
          ))}
        </nav>
        <ReviewStatus className="mt-8" />
      </PageHero>

      {servicePhases.map((phase, i) => {
        const list = servicesByPhase(phase.id);
        return (
          <section
            key={phase.id}
            id={`phase-${phase.id}`}
            aria-labelledby={`phase-${phase.id}-title`}
            className={i % 2 === 1 ? "mt-24 scroll-mt-24 border-y border-border bg-card/60 py-20" : "mt-24 scroll-mt-24"}
          >
            <div className="page-container grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <span className="display block text-7xl leading-none text-terracotta tabular-nums sm:text-8xl" aria-hidden="true">
                  {phase.number}
                </span>
                <h2 id={`phase-${phase.id}-title`} className="display mt-5 text-4xl leading-[1.06] text-ink">
                  {phase.title} {phase.accent}
                </h2>
                <p className="mt-5 leading-relaxed text-muted">{phase.description}</p>
                <p className="mt-4 text-sm text-muted">
                  {list.length} {list.length === 1 ? "service" : "services"}
                </p>
              </div>
              <ul className="grid gap-5">
                {list.map((s) => (
                  <ServiceCard key={s.slug} service={s} />
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      {/* We coordinate, authorised bodies issue */}
      <section className="page-container mt-28" aria-labelledby="coordinate-title">
        <div className="reveal panel-sheen relative overflow-hidden rounded-[1.75rem] bg-inverse p-7 text-on-inverse sm:p-14 dark:ring-1 dark:ring-border-strong">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_18rem_at_100%_100%,rgb(176_141_87/0.22),transparent_70%)]" aria-hidden="true" />
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-accent-on-inverse uppercase">Who does what</p>
              <h2 id="coordinate-title" className="display mt-5 text-4xl leading-[1.06] sm:text-5xl">
                We coordinate. <span className="display-italic text-accent-on-inverse">Authorised bodies issue.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-on-inverse/75">
                AsterPath does not issue translations, attestations, apostilles, Declarations of Value, admissions, scholarships or visas. We plan each
                step, prepare your file and work with the office that does. That is why no honest consultant can guarantee an outcome.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {authorisedBodies.map((b) => (
                <li key={b.name} className="rounded-2xl bg-on-inverse/[0.06] p-5 ring-1 ring-on-inverse/10">
                  <h3 className="font-bold">{b.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-on-inverse/75">{b.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What's not included */}
      <section className="page-container mt-28" aria-labelledby="not-included-title">
        <div className="reveal grid gap-8 rounded-[1.75rem] border border-border bg-paper-deep/70 p-7 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <SectionHeading
            title={
              <span id="not-included-title">
                What the plan does not cover
              </span>
            }
            description="Most services above sit inside one AsterPath plan, quoted individually after your free consultation. Tuition, proof of funds, flights and rent stay outside it, and so does anything an authority charges you directly."
          />
          <div className="flex flex-col gap-4 lg:items-end">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-deep">
              What the plan covers, and what it doesn&rsquo;t <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/process" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-deep">
              See who does what at every stage <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <CtaSection title="Start with a profile evaluation." description="A free first conversation: where you stand, what is realistic, and which services you actually need." />
    </>
  );
}
