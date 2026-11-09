import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Clock3, FileSignature, MessageCircle, MessagesSquare, ShieldCheck, UserRound } from "lucide-react";
import { commitments, siteConfig } from "@/config/site";
import { faqs } from "@/content/faqs";
import { afterGraduation } from "@/content/italy/facts";
import { legalisationChain } from "@/content/italy/documents";
import { studyLevels } from "@/content/italy/levels";
import { processStages } from "@/content/italy/process";
import { regions } from "@/content/italy/regions";
import { universities } from "@/content/italy/universities";
import { plan } from "@/content/plan";
import { buildItalyRegionMap } from "@/lib/geo";
import { JourneyMap } from "@/components/maps/journey-map";
import { RegionExplorer } from "@/components/maps/region-explorer";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqList, faqJsonLd } from "@/components/marketing/faq-list";
import { Flag } from "@/components/marketing/flag";
import { SourceNote } from "@/components/marketing/cards";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { whatsappUrl } from "@/lib/whatsapp";

const cadence = commitments.activeStageUpdateCadence;

const promises = [
  { icon: UserRound, title: "One named advisor", body: "The same person owns your file from the first call to your arrival in Italy." },
  { icon: Clock3, title: `Replies within ${commitments.responseTimeWorkingDays} working day`, body: "Every message answered. You never have to chase us." },
  { icon: MessagesSquare, title: `${cadence.charAt(0).toUpperCase()}${cadence.slice(1)} updates`, body: "During active stages, you hear from us even when nothing has changed." },
  { icon: FileSignature, title: "Everything in writing", body: "Scope, your figure, instalments and refunds agreed before you pay anything." },
];

export default function HomePage() {
  const regionMap = buildItalyRegionMap();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: siteConfig.name,
          url: siteConfig.url,
          slogan: siteConfig.positioning,
          description: siteConfig.description,
        }}
      />
      <JsonLd data={faqJsonLd(faqs)} />

      {/* Hero */}
      <section className="atmosphere relative overflow-hidden">
        <div className="page-container relative grid items-center gap-10 pt-12 pb-16 sm:pt-16 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:pt-20 lg:pb-24">
          <div className="max-w-xl">
            <p className="eyebrow motion-safe:animate-rise">Italy specialists for students from India</p>
            <h1 className="display mt-6 text-[3rem] leading-[0.98] text-ink motion-safe:animate-rise motion-safe:[animation-delay:80ms] sm:text-7xl lg:text-[5.25rem]">
              Study in Italy, <span className="display-italic text-primary">done properly.</span>
            </h1>
            <p className="mt-7 text-lg leading-relaxed text-muted motion-safe:animate-rise motion-safe:[animation-delay:160ms] sm:text-xl">
              Universities, entrance tests, your Declaration of Value, regional scholarships and an early visa file, handled by one dedicated advisor in
              one plan, paid in instalments.
            </p>
            <div className="mt-9 flex flex-col gap-3 motion-safe:animate-rise motion-safe:[animation-delay:240ms] sm:flex-row">
              <ButtonLink href="/contact" size="lg">
                Book a free consultation <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ExternalButtonLink href={whatsappUrl()} variant="secondary" size="lg">
                <MessageCircle aria-hidden="true" /> WhatsApp an advisor
              </ExternalButtonLink>
            </div>
          </div>

          <figure className="relative motion-safe:animate-fade">
            <div className="ring-gradient float-soft overflow-hidden rounded-[1.75rem] p-2 shadow-[var(--shadow-lift)] sm:p-4">
              <JourneyMap />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm text-muted">
              <Flag code="india" className="h-3.5 w-5" />
              From the Italian missions in New Delhi, Mumbai, Kolkata and Bengaluru to Italy
              <Flag code="italy" className="h-3.5 w-5" />
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Every public university, scrolling past */}
      <section aria-label={`The ${universities.length} public universities we work with`} className="border-y border-border bg-card/50 py-5">
        <div className="marquee">
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 ? true : undefined} className="flex shrink-0 items-center">
                {universities.map((u) => (
                  <li key={u.slug} className="flex items-center gap-6 pr-6 whitespace-nowrap">
                    <span className="display-italic text-lg text-ink-soft">{u.name}</span>
                    <span className="text-xs text-terracotta" aria-hidden="true">✦</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* Overview film */}
      <section className="page-container mt-20">
        <div className="reveal grid items-center gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow mb-5">In 29 seconds</p>
            <h2 className="display text-4xl leading-[1.06] text-ink sm:text-5xl">
              How AsterPath <span className="display-italic text-primary">works.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">From your passport to your first week in Italy: the stages, the plan and the promise, in one short film.</p>
          </div>
          <video
            controls
            playsInline
            preload="none"
            poster="/video/asterpath-intro-poster.jpg"
            className="aspect-video w-full rounded-[1.5rem] border border-border bg-card shadow-[var(--shadow-lift)]"
            aria-label="A 29-second overview film: AsterPath's five stages from passport to arrival in Italy, one plan paid in instalments, and the service commitment. The film has no narration; all information is shown as on-screen text."
          >
            <source src="/video/asterpath-intro.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* Process */}
      <section className="page-container mt-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            className="reveal"
            eyebrow="How we work"
            title={
              <>
                Five stages. <span className="display-italic text-primary">Nothing left to chance.</span>
              </>
            }
            description="Each stage has a clear owner, a deadline and an outcome. We file your visa early, before the June to September rush."
          />
          <Link href="/process" className="reveal inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
            The full process <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {processStages.map((stage) => (
            <li
              key={stage.slug}
              className="reveal glow-card group rounded-[var(--radius-card)] border border-border bg-card p-6"
            >
              <span className="display block text-5xl text-terracotta tabular-nums">{String(stage.number).padStart(2, "0")}</span>
              <h3 className="mt-5 font-bold tracking-tight text-ink">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{stage.timing}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* No ghosting */}
      <section className="page-container mt-28">
        <div className="reveal panel-sheen relative overflow-hidden rounded-[1.75rem] bg-inverse p-7 text-on-inverse sm:p-14 dark:ring-1 dark:ring-border-strong">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_18rem_at_0%_100%,rgb(176_141_87/0.22),transparent_70%)]" aria-hidden="true" />
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <ShieldCheck className="size-9 text-accent-on-inverse" strokeWidth={1.4} aria-hidden="true" />
              <h2 className="display mt-6 text-4xl leading-[1.06] sm:text-5xl">
                We don&rsquo;t disappear <span className="display-italic text-accent-on-inverse">halfway.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-on-inverse/75">
                The most common complaint about study consultants is silence after the payment. {plan.intakeNote} Our service commitments are written into
                every agreement.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {promises.map(({ icon: Icon, title, body }) => (
                <li key={title} className="rounded-2xl bg-on-inverse/[0.06] p-6 ring-1 ring-on-inverse/10">
                  <Icon className="size-6 text-accent-on-inverse" strokeWidth={1.6} aria-hidden="true" />
                  <h3 className="mt-4 font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-inverse/75">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Study levels */}
      <section className="page-container mt-28">
        <SectionHeading
          className="reveal"
          eyebrow="Programmes"
          title={
            <>
              Bachelor&rsquo;s, master&rsquo;s or PhD, <span className="display-italic text-primary">each its own route.</span>
            </>
          }
          description="Eligibility, entrance tests and documents differ by level. Start with the guide for yours."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {studyLevels.map((level, i) => (
            <Link
              key={level.slug}
              href={`/study-in-italy/${level.slug}`}
              className="reveal glow-card group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-card p-7"
            >
              {/* Decorative numeral drawn with CSS content, so it is not read or contrast-checked as text. */}
              <span
                data-numeral={["I", "II", "III"][i]}
                className="display-italic pointer-events-none absolute -right-2 -bottom-8 text-[9rem] leading-none text-terracotta/[0.08] transition-transform duration-700 group-hover:-translate-y-2 after:content-[attr(data-numeral)]"
                aria-hidden="true"
              />
              <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">{level.italianName}</p>
              <h3 className="display mt-3 text-3xl text-ink">{level.title}</h3>
              <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-muted">{level.headline}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Read the guide <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Regions, scholarships and universities */}
      <section className="mt-28 border-y border-border bg-card/60 py-24">
        <div className="page-container">
          <SectionHeading
            className="reveal"
            eyebrow="Regions and universities"
            title={
              <>
                Twenty regions. <span className="display-italic text-primary">Twenty sets of rules.</span>
              </>
            }
            description="Every region runs its own scholarships. Pick one to see its scholarship office and its public universities, each linked to its official website."
          />
          <div className="mt-12">
            <RegionExplorer map={regionMap} regions={regions} universities={universities} />
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <SourceNote ids={["murDsu", "studyInItaly"]} />
            <Link href="/universities" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
              All {universities.length} public universities <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Documents chain */}
      <section className="page-container mt-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            className="reveal"
            eyebrow="Documents"
            title={
              <>
                Notary to DOV, <span className="display-italic text-primary">in the right order.</span>
              </>
            }
            description="One wrong attestation can cost months. We plan the chain for every document before you visit a single office."
          />
          <Link href="/documents" className="reveal inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
            The full checklist <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {legalisationChain.map((step, i) => (
            <li key={step.title} className="reveal glow-card rounded-[var(--radius-card)] border border-border bg-card p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-terracotta-soft text-sm font-bold text-terracotta-deep tabular-nums">{i + 1}</span>
              <h3 className="mt-4 font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.who}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* The plan */}
      <section className="mt-28 border-y border-border bg-card/60 py-24">
        <div className="page-container grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <SectionHeading
              className="reveal"
              eyebrow="One plan"
              title={
                <>
                  Everything in it. <span className="display-italic text-primary">Paid in instalments.</span>
                </>
              }
              description="No price lists and no add-ons. After your free consultation you get one written figure, paid stage by stage. Flights are the only big cost outside it."
            />
            <ol className="mt-10 flex flex-wrap gap-2">
              {plan.instalments.map((instalment, i) => (
                <li key={instalment.stage} className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-ink ring-1 ring-border">
                  <span className="display text-lg text-terracotta">{i + 1}</span>
                  {instalment.stage}
                </li>
              ))}
            </ol>
            <Link href="/pricing" className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
              What the plan covers <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="reveal ring-gradient rounded-[var(--radius-card)] p-7 shadow-[var(--shadow-lift)] sm:p-9">
            <h3 className="display text-2xl text-ink">Costs we pay for you</h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {plan.weCover.map((item) => (
                <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-soft">
                  <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* After graduation */}
      <section className="page-container mt-28">
        <div className="reveal grid gap-8 rounded-[1.75rem] border border-border bg-paper-deep/70 p-7 sm:p-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <h2 className="display text-4xl leading-[1.08] text-ink">
            After graduation, <span className="display-italic text-primary">up to a year to find work.</span>
          </h2>
          <div>
            <p className="text-lg leading-relaxed text-ink-soft">{afterGraduation.summary}</p>
            <p className="mt-4 text-sm text-muted">{afterGraduation.note}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="page-container mt-28 grid gap-12 lg:grid-cols-[1fr_2fr]">
        <div className="reveal">
          <p className="eyebrow mb-5">Questions</p>
          <h2 className="display text-4xl leading-[1.06] text-ink">Straight answers.</h2>
          <p className="mt-5 leading-relaxed text-muted">
            Something else on your mind?{" "}
            <Link href="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
              Ask us directly
            </Link>
            .
          </p>
        </div>
        <FaqList faqs={faqs.slice(0, 7)} />
      </section>

      <CtaSection />
    </>
  );
}
