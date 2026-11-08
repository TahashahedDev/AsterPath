import Link from "next/link";
import { ArrowRight, Bot, FileCheck2, Eye, HandCoins, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { siteConfig } from "@/config/site";
import { countries } from "@/content/countries";
import { faqs } from "@/content/faqs";
import { journeySteps } from "@/content/journey";
import { services } from "@/content/services";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { DestinationCard, ServiceCard } from "@/components/marketing/cards";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FaqList, faqJsonLd } from "@/components/marketing/faq-list";
import { CtaSection } from "@/components/marketing/cta-section";
import { Flag } from "@/components/marketing/flag";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { whatsappUrl } from "@/lib/whatsapp";

const principles = [
  {
    icon: Eye,
    title: "Every fee, in the open",
    body: "Our prices are published. Third-party costs are listed separately, so you know what you pay us and what you pay others.",
  },
  {
    icon: ShieldCheck,
    title: "No promises we can't keep",
    body: "Universities decide admissions and governments decide visas. We'll never guarantee either — we'll prepare you properly instead.",
  },
  {
    icon: Users,
    title: "Built from experience",
    body: "Our founding team has been through the international student application and visa process themselves.",
  },
];

const documentSupport = [
  { title: "Document review", who: "AsterPath", body: "Completeness, consistency and formatting checks with clear feedback." },
  { title: "Certified translations", who: "Qualified translators", body: "We identify what needs translating and coordinate with qualified partners." },
  { title: "Apostille", who: "Government authority", body: "We tell you which documents need one and coordinate through authorised agencies." },
  { title: "Legalisation", who: "Government authorities", body: "Where an apostille isn't the right route, we map the correct legalisation chain." },
];

const workPathway = [
  "How working during your studies is regulated in each country",
  "Official post-study stay and job-seeker routes",
  "CVs and applications for European employers",
  "Document preparation for work-related permits",
];

const studyServices = services.filter((s) => s.category === "study").slice(0, 6);
const previewSteps = journeySteps.filter((s) => [1, 2, 3, 5, 8, 10].includes(s.number));

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          slogan: siteConfig.tagline,
          contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: siteConfig.contactEmail },
        }}
      />
      <JsonLd data={faqJsonLd(faqs)} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hairline-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="page-container relative grid items-center gap-6 pt-12 pb-16 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-20 lg:pb-24">
          <div className="max-w-xl">
            <p className="eyebrow flex items-center gap-3 motion-safe:animate-rise">
              <span className="flex gap-1.5" aria-hidden="true">
                {countries.map((c) => (
                  <Flag key={c.slug} code={c.slug} className="h-3 w-[1.125rem]" />
                ))}
              </span>
              Study in Italy · Germany · France
            </p>
            <h1 className="mt-6 text-[2.625rem] leading-[1.02] font-semibold tracking-[-0.035em] text-ink motion-safe:animate-rise motion-safe:[animation-delay:80ms] sm:text-6xl lg:text-[4.25rem]">
              Your journey to Europe starts with a <span className="serif-accent text-primary">clearer path.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted motion-safe:animate-rise motion-safe:[animation-delay:160ms] sm:text-xl">
              From choosing the right university to preparing your documents and navigating your next steps, AsterPath helps make your
              international education journey simpler and more transparent.
            </p>
            <div className="mt-9 flex flex-col gap-3 motion-safe:animate-rise motion-safe:[animation-delay:240ms] sm:flex-row">
              <ButtonLink href="/contact" size="lg">
                Build my study plan <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ExternalButtonLink href={whatsappUrl()} variant="secondary" size="lg">
                <MessageCircle aria-hidden="true" /> Talk to an advisor
              </ExternalButtonLink>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted motion-safe:animate-rise motion-safe:[animation-delay:320ms]">
              {["Published pricing", "Milestone payments", "Free first assessment"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <figure className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
            <HeroVisual />
            <figcaption className="mt-2 text-center font-serif text-xl text-ink-soft italic sm:text-2xl">
              One student. One ambition. A world of possibilities.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Trust and transparency */}
      <section className="border-y border-border bg-card/60">
        <div className="page-container grid gap-12 py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="reveal">
            <p className="eyebrow mb-4">Why AsterPath</p>
            <h2 className="text-3xl leading-[1.1] font-semibold tracking-[-0.025em] sm:text-4xl">
              We&rsquo;re a new team. <span className="serif-accent text-ink-soft">We&rsquo;d rather tell you that</span> than invent a track record.
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {principles.map(({ icon: Icon, title, body }) => (
              <div key={title} className="reveal">
                <Icon className="size-6 text-primary" strokeWidth={1.6} aria-hidden="true" />
                <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="page-container mt-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            className="reveal"
            eyebrow="Destinations"
            title={<>Three countries, <span className="serif-accent">each done properly.</span></>}
            description="Every country has its own application system, documents and visa process. We focus on three so we can know each one deeply."
          />
          <Link href="/destinations" className="reveal inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-deep">
            Compare destinations <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {countries.map((country) => (
            <DestinationCard key={country.slug} country={country} className="reveal" />
          ))}
        </div>
      </section>

      {/* Study services */}
      <section className="page-container mt-28">
        <SectionHeading
          className="reveal"
          eyebrow="Study abroad services"
          title="Help where you need it, not a package you don't."
          description="From your first shortlist to your first week abroad. Every service says plainly who does the work."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studyServices.map((service) => (
            <div key={service.slug} className="reveal">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-deep">
            See all services <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Work pathways */}
      <section className="page-container mt-28">
        <div className="reveal grid gap-10 rounded-[1.5rem] border border-border bg-paper-deep/70 p-7 sm:p-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow mb-4">Work pathways</p>
            <h2 className="text-3xl leading-[1.1] font-semibold tracking-[-0.025em] sm:text-4xl">
              Thinking beyond graduation? <span className="serif-accent">Plan it with real rules.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Rules on working during and after study differ by country and change over time. We explain the official routes that may
              apply to you and help you prepare — we are not a recruitment agency, and we never promise jobs or permits.
            </p>
            <ButtonLink href="/services/work-pathways" variant="dark" className="mt-8">
              Explore work pathway guidance
            </ButtonLink>
          </div>
          <ul className="grid content-center gap-3">
            {workPathway.map((item, index) => (
              <li key={item} className="flex items-center gap-4 rounded-xl bg-card px-5 py-4 shadow-[var(--shadow-card)]">
                <span className="font-serif text-2xl text-gold-deep tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-[0.9375rem] text-ink-soft">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works / journey */}
      <section className="page-container mt-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            className="reveal"
            eyebrow="How AsterPath works"
            title={<>Your journey, <span className="serif-accent">one clear step at a time.</span></>}
            description="You always know what's done, what's next, who's responsible and when it's due."
          />
          <Link href="/how-it-works" className="reveal inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-deep">
            See all 11 steps <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div role="region" aria-label="Key journey steps" tabIndex={0} className="mt-12 -mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <ol className="flex snap-x snap-mandatory gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {previewSteps.map((step) => (
              <li key={step.number} className="reveal relative min-w-[78%] snap-start rounded-[var(--radius-card)] border border-border bg-card p-6 sm:min-w-0">
                <span className="font-serif text-4xl text-primary tabular-nums">{String(step.number).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-4 text-sm text-muted">Actual steps and their order vary by country, university and your circumstances.</p>
      </section>

      {/* Pricing preview */}
      <section className="mt-28 border-y border-border bg-card/60 py-24">
        <div className="page-container">
          <SectionHeading
            align="center"
            className="reveal"
            eyebrow="Transparent pricing"
            title={<>Published prices. <span className="serif-accent">Paid in milestones.</span></>}
            description="No large upfront fee. You pay as each stage of work is delivered, and third-party costs are always shown separately."
          />
          <div className="mt-14">
            <PricingCards />
          </div>
          <div className="mt-8 text-center">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-deep">
              Compare packages and see what&rsquo;s excluded <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Documents & legalisation */}
      <section className="page-container mt-28 grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div className="reveal lg:sticky lg:top-28 lg:self-start">
          <FileCheck2 className="size-8 text-primary" strokeWidth={1.4} aria-hidden="true" />
          <h2 className="mt-6 text-3xl leading-[1.1] font-semibold tracking-[-0.025em] sm:text-4xl">
            Documents, translations and apostilles — <span className="serif-accent">without the guesswork.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            We coordinate. Authorised bodies certify. You always know who is doing what, and every external fee is shown before you
            commit.
          </p>
        </div>
        <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-card">
          {documentSupport.map((item) => (
            <li key={item.title} className="reveal grid gap-1 p-6 sm:grid-cols-[1fr_auto] sm:gap-6">
              <div>
                <h3 className="font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{item.body}</p>
              </div>
              <p className="text-sm text-gold-deep sm:text-right">{item.who}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* AI-assisted support */}
      <section className="page-container mt-28">
        <div className="reveal grid gap-10 rounded-[1.5rem] border border-border bg-card p-7 sm:p-12 lg:grid-cols-[auto_1fr] lg:gap-14">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
            <Bot className="size-7" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div>
            <Badge tone="gold">In development</Badge>
            <h2 className="mt-4 text-3xl leading-[1.1] font-semibold tracking-[-0.025em] sm:text-4xl">
              Answers at any hour. <span className="serif-accent">People for what matters.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              We&rsquo;re building an assistant to help with common questions about your case — grounded only in information our team
              has reviewed, showing its sources, and handing over to your advisor whenever a decision needs a person.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Explains your next steps and pending tasks",
                "Never decides on visas, eligibility or payments",
                "Never reads your private documents without explicit permission",
              ].map((item) => (
                <li key={item} className="border-l-2 border-gold pl-4 text-[0.9375rem] leading-relaxed text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="page-container mt-28 grid gap-12 lg:grid-cols-[1fr_2fr]">
        <div className="reveal">
          <HandCoins className="size-8 text-primary" strokeWidth={1.4} aria-hidden="true" />
          <h2 className="mt-6 text-3xl leading-[1.1] font-semibold tracking-[-0.025em] sm:text-4xl">Straight answers</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Something else on your mind?{" "}
            <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
              Ask us directly
            </Link>
            .
          </p>
        </div>
        <FaqList faqs={faqs.slice(0, 6)} />
      </section>

      <CtaSection />
    </>
  );
}
