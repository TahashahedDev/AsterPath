import type { Metadata } from "next";
import { commitments } from "@/config/site";
import { entranceTests } from "@/content/italy/facts";
import { processStages, responsibilityLaneLabels, responsibilityLanes, type ResponsibilityLane } from "@/content/italy/process";
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

const laneOrder: ResponsibilityLane[] = ["you", "asterpath", "university", "authority"];
const laneTone: Record<ResponsibilityLane, string> = {
  you: "bg-card",
  asterpath: "bg-primary-soft/60",
  university: "bg-card",
  authority: "bg-gold-soft/50",
};

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

      <section className="page-container mt-20" aria-labelledby="lanes-title">
        <div className="reveal max-w-2xl">
          <p className="eyebrow mb-5">Who does what</p>
          <h2 id="lanes-title" className="display text-4xl leading-[1.06] text-ink sm:text-5xl">
            Who does what, and when
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            At every stage, some steps are yours, some are ours, and the decisions belong to the university or the authorities. Processes differ by
            country: this is the timeline for Italy.
          </p>
        </div>

        <div className="mt-12">
          <div className="hidden gap-3 px-1 pb-3 lg:grid lg:grid-cols-[12rem_repeat(4,minmax(0,1fr))]" aria-hidden="true">
            <span />
            {laneOrder.map((lane) => (
              <span key={lane} className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">
                {responsibilityLaneLabels[lane]}
              </span>
            ))}
          </div>
          <ol className="grid gap-4">
            {processStages.map((stage) => {
              const lanes = responsibilityLanes[stage.slug];
              if (!lanes) return null;
              return (
                <li key={stage.slug} className="reveal grid gap-3 rounded-[var(--radius-card)] border border-border bg-card/60 p-4 sm:p-5 lg:grid-cols-[12rem_repeat(4,minmax(0,1fr))] lg:items-stretch">
                  <div className="flex items-baseline gap-3 lg:block lg:pr-2">
                    <span className="display text-4xl leading-none text-terracotta tabular-nums">{String(stage.number).padStart(2, "0")}</span>
                    <a href={`#${stage.slug}`} className="font-bold tracking-tight text-ink hover:text-primary lg:mt-3 lg:block">
                      {stage.title}
                    </a>
                  </div>
                  <dl className="contents">
                    {laneOrder.map((lane) => (
                      <div key={lane} className={`rounded-2xl p-4 ring-1 ring-border ${laneTone[lane]}`}>
                        <dt className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase lg:sr-only">{responsibilityLaneLabels[lane]}</dt>
                        <dd className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft lg:mt-0">{lanes[lane]}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ol>
          <p className="mt-5 text-sm text-muted">
            AsterPath prepares and coordinates. We do not decide admission, scholarships, visas or permits, and we do not issue attestations or
            translations.
          </p>
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
            The whole journey in 26 seconds
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
