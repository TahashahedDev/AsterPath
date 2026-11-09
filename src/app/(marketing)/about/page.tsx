import type { Metadata } from "next";
import { Ban, Compass, Eye, HeartHandshake } from "lucide-react";
import { commitments, founders } from "@/config/site";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "About AsterPath",
  description: "Why AsterPath focuses only on Italy, how we work, and the commitments we make to every student.",
  alternates: { canonical: "/about" },
};

const principles = [
  { icon: Compass, title: "Depth over breadth", body: "We chose one country so we can know its universities, regions, scholarships and missions in real detail — not a little about everywhere." },
  { icon: Eye, title: "Radical transparency", body: "Published prices, every exclusion listed, sources linked, and the date we last checked each requirement." },
  { icon: HeartHandshake, title: "Accountability", body: `One advisor per student, replies within ${commitments.responseTimeWorkingDays} working day, ${commitments.activeStageUpdateCadence} updates and everything agreed in writing.` },
];

const wontDo = [
  "Guarantee admission, scholarships or visas — those decisions belong to universities, regional bodies and the Italian authorities.",
  "Submit applications in your name without your involvement.",
  "Ask for documents over WhatsApp or email.",
  "Place you in a job or charge for job placement.",
  "Hide fees, partner arrangements or third-party costs.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>We do one country. <span className="display-italic text-primary">We do it properly.</span></>}
        description="AsterPath was started by people who went through the Italian university application and visa process themselves — and saw how much confusion, cost and silence students face along the way."
      />

      <section className="page-container mt-20 grid gap-5 md:grid-cols-3">
        {principles.map(({ icon: Icon, title, body }) => (
          <div key={title} className="reveal rounded-[var(--radius-card)] border border-border bg-card p-7">
            <Icon className="size-8 text-terracotta" strokeWidth={1.4} aria-hidden="true" />
            <h2 className="display mt-6 text-2xl text-ink">{title}</h2>
            <p className="mt-3 leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </section>

      {founders.length > 0 && (
        <section className="page-container mt-28">
          <SectionHeading eyebrow="The team" title="The people behind your file." />
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {founders.map((f) => (
              <li key={f.name} className="rounded-[var(--radius-card)] border border-border bg-card p-7">
                <h3 className="display text-2xl text-ink">{f.name}</h3>
                <p className="mt-1 text-sm font-semibold text-terracotta-deep">{f.role}</p>
                <p className="mt-4 leading-relaxed text-muted">{f.bio}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="page-container mt-28">
        <div className="reveal grid gap-10 rounded-[1.75rem] border border-border bg-paper-deep/70 p-7 sm:p-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <Ban className="size-9 text-terracotta" strokeWidth={1.4} aria-hidden="true" />
            <h2 className="display mt-6 text-4xl leading-tight text-ink">What we will never do</h2>
          </div>
          <ul className="space-y-4">
            {wontDo.map((item) => (
              <li key={item} className="flex gap-4 border-b border-border pb-4 text-[1.0625rem] leading-relaxed text-ink-soft last:border-0 last:pb-0">
                <span className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-terracotta" aria-hidden="true" />
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
