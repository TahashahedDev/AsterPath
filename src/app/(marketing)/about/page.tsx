import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { commitments, founders } from "@/config/site";
import { CheckList } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "About AsterPath",
  description: "Why AsterPath exists, what we do and what universities and authorities decide, and the commitments we make to every student, starting with Italy.",
  alternates: { canonical: "/about" },
};

const principles = [
  { title: "One country at a time", body: "We started with Italy so we could know its universities, regions, scholarships and missions in real detail. We open a new destination only when we know it as well." },
  { title: "Few students", body: "We take a limited number of students each intake, so every file gets the attention it needs." },
  { title: "Everything in writing", body: `One advisor, replies within ${commitments.responseTimeWorkingDays} working day, ${commitments.activeStageUpdateCadence} updates, and one written figure for your plan.` },
];

const trustLines = [
  { line: "We explain before we charge.", body: "Your free consultation tells you what is realistic, what it involves and what it costs, before you pay anything." },
  { line: "You know what happens next.", body: "Every stage has an owner, a timing and an outcome, and you always know which step is yours." },
  { line: "Every document has a purpose.", body: "We ask only for what a university, mission or office actually needs, and tell you why." },
  { line: "Your application is more than a tracking number.", body: "One named advisor knows your file, your reasons and your deadlines, from the first call to arrival." },
];

const weDo = [
  "Evaluate your profile honestly and plan a realistic route",
  "Shortlist programmes from official university requirements",
  "Prepare and review every application with you",
  "Plan translations, attestation and apostille with the offices that issue them",
  "Build your visa file against the mission's current checklist",
  "Guide your first weeks after arrival",
];

const theyDecide = [
  { who: "Universities", what: "decide admission and confirm enrolment" },
  { who: "Regional scholarship offices", what: "decide DSU awards" },
  { who: "State departments and the MEA", what: "attest and apostille your documents" },
  { who: "Italian missions and CIMEA", what: "issue the Declaration of Value or statement" },
  { who: "Consulates and immigration offices", what: "decide visas and residence permits" },
];

const wontDo = [
  "Guarantee admission, scholarships or visas. Those decisions belong to universities, regional offices and the Italian authorities.",
  "Submit applications in your name without you.",
  "Ask for your documents over WhatsApp or email.",
  "Place you in a job, or charge for job placement.",
  "Hide fees, partner arrangements or third-party costs.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About AsterPath"
        title={
          <>
            We explain everything <span className="display-italic text-primary">before you pay.</span>
          </>
        }
        description="AsterPath was started by people who went through the Italian application and visa process themselves, and saw how much confusion, cost and silence students face."
      />

      {/* Why we exist */}
      <section className="page-container mt-20" aria-labelledby="why-title">
        <div className="reveal grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-5">Why AsterPath exists</p>
            <h2 id="why-title" className="display text-4xl leading-[1.06] text-ink sm:text-5xl">
              Studying abroad should not <span className="display-italic text-primary">feel like guesswork.</span>
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>
              Students from India are often asked to pay before anyone explains what is realistic. Documents get attested at the wrong office, deadlines
              arrive without warning, and after the payment the replies slow down.
            </p>
            <p>
              We built AsterPath to work the other way round: explain first, put everything in writing, and stay with each student until they are
              settled. Italy is our flagship destination, and{" "}
              <Link href="/destinations" className="font-semibold text-primary underline-offset-4 hover:underline">
                Germany and France are opening next
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Trust lines */}
      <section className="page-container mt-24" aria-labelledby="trust-title">
        <div className="reveal panel-sheen relative overflow-hidden rounded-[1.75rem] bg-inverse p-7 text-on-inverse sm:p-14 dark:ring-1 dark:ring-border-strong">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_18rem_at_0%_100%,rgb(176_141_87/0.22),transparent_70%)]" aria-hidden="true" />
          <h2 id="trust-title" className="sr-only">
            What you can expect from us
          </h2>
          <ol className="relative grid gap-x-12 gap-y-10 md:grid-cols-2">
            {trustLines.map((t, i) => (
              <li key={t.line} className="grid grid-cols-[auto_1fr] gap-5">
                <span className="display text-4xl leading-none text-accent-on-inverse tabular-nums" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="display text-2xl leading-[1.15] sm:text-3xl">{t.line}</p>
                  <p className="mt-3 leading-relaxed text-on-inverse/75">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What we do, what institutions decide */}
      <section className="page-container mt-24" aria-labelledby="roles-title">
        <h2 id="roles-title" className="reveal display max-w-2xl text-4xl leading-[1.06] text-ink sm:text-5xl">
          What we do, and what we never claim to
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="reveal glow-card rounded-[var(--radius-card)] border border-border bg-card p-7 sm:p-9">
            <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">AsterPath</p>
            <h3 className="display mt-3 text-2xl text-ink">Prepares, plans and coordinates</h3>
            <CheckList items={weDo} className="mt-6" />
            <Link href="/services" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
              All our services <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="reveal rounded-[var(--radius-card)] border border-border bg-paper-deep/70 p-7 sm:p-9">
            <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">Institutions</p>
            <h3 className="display mt-3 text-2xl text-ink">Decide and issue</h3>
            <ul className="rows mt-4">
              {theyDecide.map((d) => (
                <li key={d.who} className="py-4 leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">{d.who}</span> {d.what}.
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted">That is why no honest consultant can guarantee an admission, a scholarship or a visa.</p>
          </div>
        </div>
      </section>


      <section className="section-s band-moss mt-24" aria-label="How we work">
        <div className="page-container cols gap-y-10">
          {principles.map((p) => (
            <div key={p.title} className="card col-span-4">
              <h2 className="text-[length:var(--text-title)]">{p.title}</h2>
              <p className="mt-3 leading-relaxed text-ink-2">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {founders.length > 0 && (
        <section className="section" aria-labelledby="team-title">
          <div className="page-container">
            <h2 id="team-title">The people behind your file.</h2>
            <ul className="cols mt-[var(--space-2xl)] gap-y-10">
              {founders.map((f) => (
                <li key={f.name} className="col-span-6">
                  <h3>{f.name}</h3>
                  <p className="label mt-1">{f.role}</p>
                  <p className="mt-4 leading-relaxed text-ink-2">{f.bio}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="never-title">
        <div className="page-container cols">
          <h2 id="never-title" className="col-span-4">
            What we will never do.
          </h2>
          <ul className="rows col-span-8">
            {wontDo.map((item) => (
              <li key={item} className="py-5 text-[1.125rem] leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaSection title="Talk to us before you decide." description="A free consultation is the best way to see how we work. No pressure, no obligation." />
    </>
  );
}
