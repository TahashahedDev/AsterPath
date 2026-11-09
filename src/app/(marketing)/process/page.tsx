import type { Metadata } from "next";
import { commitments } from "@/config/site";
import { entranceTests } from "@/content/italy/facts";
import { processStages } from "@/content/italy/process";
import { sources } from "@/content/italy/sources";
import { CheckList, ReviewStatus } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "How we work: five stages from passport to Italy",
  description: "How AsterPath takes Indian students to Italy: documents, English and entrance tests, applications and enrolment, the visa filed early, and arrival.",
  alternates: { canonical: "/process" },
};

const promises = [
  "One named advisor for your whole journey",
  `Replies within ${commitments.responseTimeWorkingDays} working day`,
  `${commitments.activeStageUpdateCadence.charAt(0).toUpperCase()}${commitments.activeStageUpdateCadence.slice(1)} updates during active stages`,
  "A limited number of students each intake",
];

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="How we work"
        title={
          <>
            From your passport <span className="display-italic text-primary">to your first week in Italy.</span>
          </>
        }
        description="Five stages, each with an owner, a time and an outcome. This is how we work with every student, and what we will ask of you.">
        <ReviewStatus />
      </PageHero>

      <section className="field section-s" aria-label="Our commitments">
        <div className="page-container cols gap-y-6">
          {promises.map((p) => (
            <p key={p} className="col-span-3 font-display text-[length:var(--text-title)] leading-[1.15] font-medium tracking-[-0.02em]">
              {p}
            </p>
          ))}
        </div>
      </section>

      {processStages.map((stage) => (
        <section key={stage.slug} id={stage.slug} aria-labelledby={`${stage.slug}-title`} className="section scroll-mt-28">
          <div className="page-container cols gap-y-[var(--space-2xl)]">
            <div className="col-span-5">
              <span className="figure-xl block text-[clamp(5rem,10vw,9rem)] text-accent">{stage.number}</span>
              <h2 id={`${stage.slug}-title`} className="mt-4">
                {stage.title}
              </h2>
              <p className="label mt-3">{stage.timing}</p>
              <p className="mt-5 max-w-[46ch] leading-relaxed text-ink-2">{stage.summary}</p>
            </div>
            <div className="col-span-6 col-start-7 grid gap-10 sm:grid-cols-2">
              <div>
                <h3>What we do</h3>
                <CheckList items={stage.weDo} className="mt-4" />
              </div>
              <div>
                <h3>What you do</h3>
                <CheckList items={stage.youDo} className="mt-4" />
                <p className="label mt-8">You finish with</p>
                <p className="mt-1 font-medium">{stage.outcome}</p>
              </div>
              <p className="text-sm text-muted sm:col-span-2">
                Official sources:{" "}
                {stage.sources.map((id, j) => (
                  <span key={id}>
                    <a href={sources[id].url} target="_blank" rel="noopener noreferrer" className="link">
                      {sources[id].label}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                    {j < stage.sources.length - 1 ? ", " : "."}
                  </span>
                ))}
              </p>
            </div>
          </div>
          {stage.slug === "english" && (
            <div className="page-container mt-[var(--space-2xl)]">
              <ul className="rows">
                {entranceTests.map((t) => (
                  <li key={t.name} className="cols py-6">
                    <h3 className="col-span-4 text-[1.25rem]">
                      {t.name}
                      <span className="label mt-1 block">{t.who}</span>
                    </h3>
                    <p className="col-span-8 max-w-[65ch] leading-relaxed text-ink-2">{t.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}

      <section className="section" aria-labelledby="film-title">
        <div className="page-container cols items-end gap-y-8">
          <h2 id="film-title" className="col-span-4">
            The whole journey in 26 seconds.
          </h2>
          <video
            controls
            playsInline
            preload="none"
            poster="/video/asterpath-intro-poster.jpg"
            className="col-span-8 aspect-video w-full rounded-[var(--radius-card)] bg-paper-2"
            aria-label="A 26-second overview film of AsterPath's stages, plan and commitments. The film has no narration; all information is shown as on-screen text."
          >
            <source src="/video/asterpath-intro.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      <CtaSection title="Ready for stage one?" />
    </>
  );
}
