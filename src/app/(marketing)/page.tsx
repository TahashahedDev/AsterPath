import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarCheck, Check, MessageCircle } from "lucide-react";
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
import { Magnetic } from "@/components/motion/magnetic";
import { TiltCard } from "@/components/motion/tilt-card";
import { RegionExplorer } from "@/components/maps/region-explorer";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqList, faqJsonLd } from "@/components/marketing/faq-list";
import { Flag } from "@/components/marketing/flag";
import { SourceNote } from "@/components/marketing/cards";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { whatsappUrl } from "@/lib/whatsapp";

const cadence = commitments.activeStageUpdateCadence;

const promises = [
  { title: "One named advisor", body: "The same person owns your file from the first call until you land in Italy. If they leave, we tell you who takes over and why." },
  { title: `A reply within ${commitments.responseTimeWorkingDays} working day`, body: "To every message, on WhatsApp or email, including the ones that just say “any news?”." },
  { title: `${cadence.charAt(0).toUpperCase()}${cadence.slice(1)} updates`, body: "While a stage is active you hear from us every week, even when the answer is “still waiting for the university”." },
  { title: "Scope and refunds in writing", body: "What's included, your figure, the instalments and the refund rules are agreed before you pay anything." },
];

/** Months before a September intake each stage usually runs, for the timeline bars. Labels come from the stage content. */
const stageWindows: Record<string, [number, number]> = { documents: [12, 8], english: [10, 6], applications: [9, 4], visa: [4, 1], arrival: [0, -1] };
const timelineMonths = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1];

const principles = [
  { title: "You see the figure before you pay", body: "The consultation covers your options, the timeline and the risks. Then you get one figure in writing, and only then do you decide." },
  { title: "You always know the next date", body: "Each stage has an owner and a deadline, and your portal shows both. You shouldn't have to call us to find out where things are." },
  { title: "We say why each document is needed", body: "Who issues it, in what order, and what happens if it's wrong. Most repeat trips to attestation offices come from skipping this." },
  { title: "One person knows your whole file", body: "Your advisor knows your marks, your budget and your parents' questions, so you never explain your case twice." },
];

const comingDestinations = [
  { code: "germany", name: "Germany", body: "Public universities and English-taught master's programmes. Guidance opens once our country research is verified." },
  { code: "france", name: "France", body: "Grandes écoles and public universities. Join the list and we'll contact you when France opens." },
] as const;

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
            <p className="eyebrow motion-safe:animate-rise">Your next chapter starts here</p>
            <h1 className="display mt-6 text-[3.375rem] leading-[0.95] text-ink sm:text-[5rem] lg:text-[5.875rem]">
              {["Study", "in", "Italy,"].map((word, i) => (
                <Fragment key={word}>
                  <span className="word-rise" style={{ "--i": i } as React.CSSProperties}>
                    {word}
                  </span>{" "}
                </Fragment>
              ))}
              <span className="word-rise" style={{ "--i": 3 } as React.CSSProperties}>
                <span className="display-italic text-primary">done properly.</span>
              </span>
            </h1>
            <p className="mt-7 text-lg leading-relaxed text-muted motion-safe:animate-rise motion-safe:[animation-delay:160ms] sm:text-xl">
              For students from India: universities, entrance tests, your Declaration of Value, regional scholarships and an early visa file, handled by
              one dedicated advisor in one plan, paid in instalments.
            </p>
            <div className="mt-9 flex flex-col gap-3 motion-safe:animate-rise motion-safe:[animation-delay:240ms] sm:flex-row">
              <Magnetic className="flex sm:inline-flex">
                <ButtonLink href="/contact#enquiry" size="lg" className="w-full">
                  Start your journey <ArrowRight aria-hidden="true" />
                </ButtonLink>
              </Magnetic>
              <Magnetic className="flex sm:inline-flex">
                <ButtonLink href="/contact#book" variant="secondary" size="lg" className="w-full">
                  <CalendarCheck aria-hidden="true" /> Book a consultation
                </ButtonLink>
              </Magnetic>
            </div>
            <p className="mt-5 text-sm text-muted motion-safe:animate-rise motion-safe:[animation-delay:300ms]">
              Prefer WhatsApp?{" "}
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline">
                <MessageCircle className="size-3.5" aria-hidden="true" /> WhatsApp an advisor
              </a>
            </p>
          </div>

          <figure className="relative motion-safe:animate-fade">
            <TiltCard>
              <div className="ring-gradient float-soft overflow-hidden rounded-[1.75rem] p-2 shadow-[var(--shadow-lift)] sm:p-4">
                <JourneyMap />
              </div>
            </TiltCard>
            <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm text-muted">
              <Flag code="india" className="h-3.5 w-5" />
              From the Italian missions in New Delhi, Mumbai, Kolkata and Bengaluru to Italy
              <Flag code="italy" className="h-3.5 w-5" />
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Coverage, stated plainly */}
      <section className="border-y border-border bg-card/50">
        <p className="page-container flex flex-col gap-2 py-5 text-[0.9375rem] text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>
            We work with all {universities.length} public universities in Italy, from Politecnico di Milano to the University of Palermo.
          </span>
          <Link href="/universities" className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary hover:text-primary-deep">
            See the list <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </p>
      </section>

      {/* Why we exist */}
      <section className="page-container pt-20 pb-14 sm:pt-24 sm:pb-16" aria-labelledby="principles-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div className="reveal lg:sticky lg:top-28 lg:self-start">
            <h2 id="principles-title" className="display text-4xl leading-[1.06] text-ink sm:text-5xl">
              Why we started AsterPath
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              An international degree is one of the biggest decisions a family makes. We started AsterPath after going through the applications and the
              visa ourselves. Most of what went wrong for us came down to nobody explaining things early enough.
            </p>
          </div>
          <ol className="divide-y divide-border border-y border-border">
            {principles.map((p, i) => (
              <li key={p.title} className="reveal row-hover grid gap-3 py-8 sm:grid-cols-[4.5rem_1fr] sm:gap-6">
                <span className="row-num display text-4xl text-terracotta tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="display text-2xl leading-snug text-ink sm:text-[1.75rem]">{p.title}</h3>
                  <p className="mt-2 max-w-xl leading-relaxed text-muted">{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Overview film */}
      <section className="page-container py-14 sm:py-16">
        <div className="reveal grid items-center gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="display text-4xl leading-[1.06] text-ink sm:text-5xl">The whole process in 29 seconds</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">From your passport to your first week in Italy. No narration, so it works with the sound off.</p>
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

      {/* Process, drawn as a timeline */}
      <section className="page-container py-14 sm:py-16" aria-labelledby="process-title">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            className="reveal"
            eyebrow="For a September intake"
            title={<span id="process-title">Start about a year before you fly.</span>}
            description="Five stages, each with an owner and a deadline. We file your visa early, before the June to September rush at the visa centres."
          />
          <Link href="/process" className="reveal inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
            Each stage in detail <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="reveal mt-12 rounded-[var(--radius-card)] border border-border bg-card p-5 sm:p-8">
          <div className="hidden grid-cols-[16rem_minmax(0,1fr)] gap-6 pb-3 text-xs text-subtle md:grid" aria-hidden="true">
            <span />
            <span className="grid grid-cols-14 tabular-nums">
              {timelineMonths.map((m) => (
                <span key={m} className={m === 0 ? "font-semibold text-terracotta-deep" : ""}>{m === 0 ? "Intake" : m > 0 ? `${m}m` : ""}</span>
              ))}
            </span>
          </div>
          <ol className="divide-y divide-border">
            {processStages.map((stage) => {
              const [from, to] = stageWindows[stage.slug] ?? [0, 0];
              return (
                <li key={stage.slug} className="grid gap-2 py-4 md:grid-cols-[16rem_minmax(0,1fr)] md:items-center md:gap-6">
                  <div>
                    <p className="font-semibold text-ink">{stage.title}</p>
                    <p className="text-sm text-muted">{stage.timing}</p>
                  </div>
                  <div className="relative hidden h-2.5 rounded-full bg-paper-deep md:block" aria-hidden="true">
                    <span
                      className="absolute inset-y-0 rounded-full bg-primary/80"
                      style={{ left: `${((12 - from) / 14) * 100}%`, width: `${Math.max(from - to, 0.6) / 14 * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Study levels */}
      <section className="page-container py-14 sm:py-16" aria-labelledby="levels-title">
        <h2 id="levels-title" className="reveal display max-w-2xl text-[2.25rem] leading-[1.06] text-ink sm:text-5xl">
          Bachelor&rsquo;s, master&rsquo;s or PhD
        </h2>
        <p className="reveal mt-6 max-w-2xl text-lg leading-relaxed text-muted">Eligibility, entrance tests and documents differ by level. Start with the guide for yours.</p>
        <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
          {studyLevels.map((level) => (
            <li key={level.slug} className="reveal border-t border-border-strong pt-6 md:px-8 md:first:pl-0 md:last:pr-0">
              <p className="text-xs leading-relaxed font-semibold tracking-[0.12em] text-terracotta-deep uppercase">{level.italianName}</p>
              <h3 className="display mt-3 text-3xl text-ink">{level.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{level.headline}</p>
              <Link href={`/study-in-italy/${level.slug}`} className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Read the guide<span className="sr-only">: {level.title}</span> <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Destinations */}
      <section className="page-container py-14 sm:py-16" aria-labelledby="destinations-title">
        <SectionHeading
          className="reveal"
          title={<span id="destinations-title">We open one country at a time</span>}
          description="Only once we know its universities, scholarships and visa rules in depth. Italy is open now. Germany and France are still being researched."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Link href="/study-in-italy" className="reveal group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-[1.75rem] bg-inverse p-7 text-on-inverse sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_22rem_at_100%_0%,rgb(176_141_87/0.28),transparent_70%)]" aria-hidden="true" />
            <svg
              viewBox={`0 0 ${regionMap.width} ${regionMap.height}`}
              className="draw-on-view pointer-events-none absolute -top-6 right-0 h-[115%] w-auto opacity-[0.16] transition-[transform,opacity] duration-700 group-hover:-translate-y-1 group-hover:opacity-25 sm:-right-4"
              aria-hidden="true"
            >
              {regionMap.regions.map((r) => (
                <path key={r.code} d={r.d} pathLength={1} fill="none" stroke="currentColor" strokeWidth={1.2} className="text-accent-on-inverse" />
              ))}
            </svg>
            <span className="absolute top-7 left-7 sm:top-10 sm:left-10">
              <Flag code="italy" className="h-6 w-9" />
            </span>
            <div className="relative">
              <p className="text-xs font-semibold tracking-[0.16em] text-accent-on-inverse uppercase">Open now · Flagship</p>
              <h3 className="display mt-3 text-5xl sm:text-6xl">Italy</h3>
              <p className="mt-4 max-w-md leading-relaxed text-on-inverse/75">
                {universities.length} public universities, regional DSU scholarships, Universitaly, the DOV and the study visa, all mapped in detail.
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-on-inverse">
                Explore Italy <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
          <div className="grid gap-5">
            {comingDestinations.map((d) => (
              <Link
                key={d.code}
                href={`/destinations/${d.code}`}
                className="reveal glow-card group flex flex-col justify-between rounded-[var(--radius-card)] border border-border bg-card p-7"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">Opening next</p>
                  <Flag code={d.code} className="h-5 w-7.5" />
                </div>
                <h3 className="display mt-4 text-3xl text-ink">{d.name}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{d.body}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Join the early list <ArrowUpRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Regions, scholarships and universities */}
      <section className="border-y border-border/70 bg-sage/70 py-16 sm:py-20">
        <div className="page-container">
          <SectionHeading
            className="reveal"
            eyebrow="Regional scholarships"
            title="Each region runs its own scholarship office"
            description="So the rules for a DSU grant in Lombardy are not the rules in Sicily. Pick a region to see its office and its public universities, each linked to the official website."
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

      {/* Documents chain, as a routing slip */}
      <section className="page-container py-14 sm:py-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            className="reveal"
            title="The order your documents travel in"
            description="Get one step out of order and the next office sends you back, which can cost weeks. We plan the route for each document before you visit a single office."
          />
          <Link href="/documents" className="reveal inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
            The full checklist <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ol className="reveal mt-12 grid overflow-hidden rounded-[var(--radius-card)] border border-border bg-card lg:grid-cols-5 lg:divide-x lg:divide-border">
          {legalisationChain.map((step, i) => (
            <li key={step.title} className="relative border-b border-border p-5 last:border-b-0 lg:border-b-0 lg:p-6">
              <p className="display text-lg text-terracotta-deep tabular-nums">Step {i + 1}</p>
              <h3 className="mt-1 font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{step.who}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted">{step.when}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Commitments, as written in the agreement */}
      <section className="page-container py-14 sm:py-16" aria-labelledby="commitments-title">
        <div className="reveal grid gap-10 border-t border-border-strong pt-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <h2 id="commitments-title" className="display text-4xl leading-[1.06] text-ink sm:text-5xl">
              What we put in your agreement
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              The complaint we hear most about study consultants is silence after the payment. So these are clauses in your agreement, not promises on a
              website. {plan.intakeNote}
            </p>
          </div>
          <dl className="divide-y divide-border">
            {promises.map((p) => (
              <div key={p.title} className="grid gap-1 py-5 first:pt-0 sm:grid-cols-[13rem_1fr] sm:gap-6">
                <dt className="font-semibold text-ink">{p.title}</dt>
                <dd className="leading-relaxed text-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The plan */}
      <section className="border-y border-border bg-paper-deep/55 py-16 sm:py-20">
        <div className="page-container grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <SectionHeading
              className="reveal"
              eyebrow="One plan"
              title={
                <>
                  One figure, <span className="display-italic text-primary">paid in five parts.</span>
                </>
              }
              description="No price list and no add-ons. After your consultation you get one figure in writing. You pay a part as each stage starts, and nothing for a stage we haven't reached. Tuition, proof of funds and flights stay outside it."
            />
            <ol className="mt-10 grid grid-cols-5" aria-label="Instalments, one as each stage starts">
              {plan.instalments.map((instalment, i) => (
                <li key={instalment.stage} className="relative flex flex-col items-center text-center">
                  {i > 0 && (
                    <>
                      <span className="absolute top-4 right-1/2 h-px w-full bg-border-strong" aria-hidden="true" />
                      <span className="track-fill absolute top-4 right-1/2 h-px w-full bg-terracotta" style={{ "--i": i } as React.CSSProperties} aria-hidden="true" />
                    </>
                  )}
                  <span className="display relative z-10 flex size-8 items-center justify-center rounded-full bg-card text-base text-terracotta-deep ring-1 ring-border-strong">{i + 1}</span>
                  <span className="mt-2.5 text-xs font-medium text-ink sm:text-sm">{instalment.stage}</span>
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
      <section className="page-container py-14 sm:py-16">
        <div className="reveal grid gap-8 rounded-[1.75rem] border border-border/70 bg-sage/60 p-7 sm:p-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <h2 className="display text-4xl leading-[1.08] text-ink">After you graduate</h2>
          <div>
            <p className="text-lg leading-relaxed text-ink-soft">{afterGraduation.summary}</p>
            <p className="mt-4 text-sm text-muted">{afterGraduation.note}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="page-container grid py-14 sm:py-16 gap-12 lg:grid-cols-[1fr_2fr]">
        <div className="reveal">
          <h2 className="display text-4xl leading-[1.06] text-ink">Questions parents ask us first</h2>
          <p className="mt-5 leading-relaxed text-muted">
            Yours isn&rsquo;t here?{" "}
            <Link href="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
              Ask us
            </Link>
            .
          </p>
        </div>
        <FaqList faqs={faqs.slice(0, 7)} />
      </section>

      <CtaSection className="mt-4 sm:mt-6" />
    </>
  );
}
