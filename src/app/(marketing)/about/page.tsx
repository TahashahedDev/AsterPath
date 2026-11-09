import type { Metadata } from "next";
import { commitments, founders } from "@/config/site";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "About AsterPath",
  description: "Why AsterPath focuses only on Italy, takes a limited number of students each intake, and the commitments we make to every one of them.",
  alternates: { canonical: "/about" },
};

const principles = [
  { title: "One country", body: "We chose Italy so we can know its universities, regions, scholarships and missions in real detail." },
  { title: "Few students", body: "We take a limited number of students each intake, so every file gets the attention it needs." },
  { title: "Everything in writing", body: `One advisor, replies within ${commitments.responseTimeWorkingDays} working day, ${commitments.activeStageUpdateCadence} updates, and one written figure for your plan.` },
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
            One country, a few students, <span className="display-italic text-primary">done properly.</span>
          </>
        }
        description="AsterPath was started by people who went through the Italian application and visa process themselves, and saw how much confusion, cost and silence students face."
      />

      <section className="section-s band-moss" aria-label="How we work">
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
