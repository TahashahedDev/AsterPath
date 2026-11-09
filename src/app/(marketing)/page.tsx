import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, FileSignature, MessageCircle, MessagesSquare, ShieldCheck, UserRound } from "lucide-react";
import { commitments, siteConfig } from "@/config/site";
import { faqs } from "@/content/faqs";
import { afterGraduation, dovRules, visaFunds } from "@/content/italy/facts";
import { legalisationChain } from "@/content/italy/documents";
import { studyLevels } from "@/content/italy/levels";
import { processStages } from "@/content/italy/process";
import { regions } from "@/content/italy/regions";
import { buildItalyRegionMap } from "@/lib/geo";
import { JourneyMap } from "@/components/maps/journey-map";
import { RegionExplorer } from "@/components/maps/region-explorer";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqList, faqJsonLd } from "@/components/marketing/faq-list";
import { Flag } from "@/components/marketing/flag";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { SourceNote } from "@/components/marketing/cards";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { whatsappUrl } from "@/lib/whatsapp";

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

const keyFigures = [
  { value: eur.format(visaFunds.annualEur), label: `Minimum yearly funds for an Italian study visa (${visaFunds.appliesTo})` },
  { value: `${dovRules.maxProcessingDays} days`, label: "Maximum time an Italian mission may take to issue your Declaration of Value" },
  { value: "20", label: "Italian regions — each with its own scholarship body and rules" },
  { value: "12 months", label: "Maximum job-seeker permit available after graduating in Italy" },
];

const cadence = commitments.activeStageUpdateCadence;

const promises = [
  { icon: UserRound, title: "One named advisor", body: "The same person owns your file from the first call to your arrival in Italy." },
  { icon: Clock3, title: `Replies within ${commitments.responseTimeWorkingDays} working day`, body: "Every message answered — you never have to chase us." },
  { icon: MessagesSquare, title: `${cadence.charAt(0).toUpperCase()}${cadence.slice(1)} updates`, body: "During active stages, you hear from us even when nothing has changed." },
  { icon: FileSignature, title: "Everything in writing", body: "Scope, price, instalments and refunds agreed before you pay anything." },
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
              Universities, Universitaly, your Declaration of Value, regional scholarships and your study visa — handled by one dedicated advisor, at
              published prices, paid in instalments.
            </p>
            <div className="mt-9 flex flex-col gap-3 motion-safe:animate-rise motion-safe:[animation-delay:240ms] sm:flex-row">
              <ButtonLink href="/contact" size="lg">
                Book a free consultation <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ExternalButtonLink href={whatsappUrl()} variant="secondary" size="lg">
                <MessageCircle aria-hidden="true" /> WhatsApp an advisor
              </ExternalButtonLink>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft motion-safe:animate-rise motion-safe:[animation-delay:320ms]">
              {["Free first consultation", "Published prices", "One advisor — no ghosting"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="size-1.5 rotate-45 bg-terracotta" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <figure className="relative motion-safe:animate-fade">
            <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card/70 p-2 shadow-[var(--shadow-lift)] backdrop-blur-sm sm:p-4">
              <JourneyMap />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm text-muted">
              <Flag code="india" className="h-3.5 w-5" />
              Four Italian missions in India
              <span aria-hidden="true" className="text-terracotta">→</span>
              <Flag code="italy" className="h-3.5 w-5" />
              one destination, done properly
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Key figures */}
      <section className="border-y border-border bg-card/70">
        <div className="page-container py-14">
          <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {keyFigures.map((f) => (
              <div key={f.value} className="reveal border-l-2 border-terracotta/60 pl-5">
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <span className="display block text-4xl text-ink tabular-nums">{f.value}</span>
                  <span className="mt-3 block text-sm leading-relaxed text-muted" aria-hidden="true">{f.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          <SourceNote ids={["vistoPerItalia", "dovChecklistMumbai", "studyInItaly"]} className="mt-10" />
        </div>
      </section>

      {/* Overview film */}
      <section className="page-container mt-24">
        <div className="reveal grid items-center gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow mb-5">In 26 seconds</p>
            <h2 className="display text-4xl leading-[1.06] text-ink sm:text-5xl">
              How AsterPath <span className="display-italic text-primary">works.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">From your passport to your first week in Italy — the stages, the prices and the promise, in one short film.</p>
          </div>
          <video
            controls
            playsInline
            preload="none"
            poster="/video/asterpath-intro-poster.jpg"
            className="aspect-video w-full rounded-[1.5rem] border border-border bg-card shadow-[var(--shadow-lift)]"
            aria-label="A 26-second overview film: AsterPath's five stages from passport to arrival in Italy, published prices paid in instalments, and the service commitment. The film has no narration; all information is shown as on-screen text."
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
            title={<>Five stages. <span className="display-italic text-primary">Nothing left to chance.</span></>}
            description="Each stage has a clear owner, a deadline and an outcome. You always know what is done, what is next and who is doing it."
          />
          <Link href="/process" className="reveal inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
            The full process <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {processStages.map((stage) => (
            <li key={stage.slug} className="reveal group relative rounded-[var(--radius-card)] border border-border bg-card p-6 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <span className="display block text-5xl text-terracotta tabular-nums">{String(stage.number).padStart(2, "0")}</span>
              <h3 className="mt-5 font-bold tracking-tight text-ink">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{stage.timing}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* No ghosting */}
      <section className="page-container mt-28">
        <div className="reveal relative overflow-hidden rounded-[1.75rem] bg-inverse p-7 text-on-inverse sm:p-14 dark:ring-1 dark:ring-border-strong">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_18rem_at_0%_100%,rgb(24_122_102/0.35),transparent_70%)]" aria-hidden="true" />
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <ShieldCheck className="size-9 text-accent-on-inverse" strokeWidth={1.4} aria-hidden="true" />
              <h2 className="display mt-6 text-4xl leading-[1.06] sm:text-5xl">
                We don&rsquo;t disappear <span className="display-italic text-accent-on-inverse">halfway.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-on-inverse/75">
                The most common complaint about study consultants is silence after the payment. Our service commitments are written into every agreement.
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
          title={<>Bachelor&rsquo;s, master&rsquo;s or PhD — <span className="display-italic text-primary">each its own route.</span></>}
          description="Eligibility, entrance rules and documents differ by level. Start with the guide for yours."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {studyLevels.map((level, i) => (
            <Link
              key={level.slug}
              href={`/study-in-italy/${level.slug}`}
              className="reveal group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-card p-7 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-lift)]"
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

      {/* Scholarships */}
      <section className="mt-28 border-y border-border bg-card/60 py-24">
        <div className="page-container">
          <SectionHeading
            className="reveal"
            eyebrow="Regional scholarships"
            title={<>Twenty regions. <span className="display-italic text-primary">Twenty sets of rules.</span></>}
            description="DSU scholarships can cover a grant, housing, meals and a tuition waiver — and every region runs its own. Explore who runs support where."
          />
          <div className="mt-12">
            <RegionExplorer map={regionMap} regions={regions} />
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <SourceNote ids={["studyInItaly", "mur"]} />
            <Link href="/scholarships" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
              How DSU and the ISEE parificato work <ArrowRight className="size-4" aria-hidden="true" />
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
            title={<>Notary to DOV, <span className="display-italic text-primary">in the right order.</span></>}
            description="One wrong attestation can cost months. We plan the chain for every document before you visit a single office."
          />
          <Link href="/documents" className="reveal inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
            Documents guide <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {legalisationChain.map((step, i) => (
            <li key={step.title} className="reveal relative rounded-[var(--radius-card)] border border-border bg-card p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-terracotta-soft text-sm font-bold text-terracotta-deep tabular-nums">{i + 1}</span>
              <h3 className="mt-4 font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.who}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pricing */}
      <section className="mt-28 border-y border-border bg-card/60 py-24">
        <div className="page-container">
          <SectionHeading
            align="center"
            className="reveal"
            eyebrow="Transparent pricing"
            title={<>Published prices. <span className="display-italic text-primary">Paid in instalments.</span></>}
            description="University application fees are included in every package. Everything that isn't included is listed — no surprises later."
          />
          <div className="mt-14">
            <PricingCards />
          </div>
          <div className="mt-8 text-center">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
              Instalments, inclusions and exclusions <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
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
