import type { Metadata } from "next";
import { ArrowUpRight, Clock3, FileSignature, MessagesSquare, UserRound } from "lucide-react";
import { commitments } from "@/config/site";
import { processStages } from "@/content/italy/process";
import { sources } from "@/content/italy/sources";
import { CheckList, ReviewStatus } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "How we work — five stages from passport to Italy",
  description: "Our five-stage process for Indian students going to Italy: documents, English test, applications and enrolment, visa, and arrival — with what we do, what you do and official sources.",
  alternates: { canonical: "/process" },
};

const commitmentsList = [
  { icon: UserRound, text: "One named advisor for your entire journey" },
  { icon: Clock3, text: `Replies within ${commitments.responseTimeWorkingDays} working day` },
  { icon: MessagesSquare, text: `${commitments.activeStageUpdateCadence.charAt(0).toUpperCase()}${commitments.activeStageUpdateCadence.slice(1)} updates during active stages` },
  { icon: FileSignature, text: "Scope, price and refunds agreed in writing" },
];

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="How we work"
        title={<>From your passport <span className="display-italic text-primary">to your first week in Italy.</span></>}
        description="Five stages, each with a clear owner, timing and outcome. This is how we work with every student — and exactly what we will ask of you."
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {commitmentsList.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3 text-sm font-semibold text-ink">
              <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" /> {text}
            </li>
          ))}
        </ul>
      </PageHero>

      <div className="page-container mt-10">
        <ReviewStatus />
      </div>

      <div className="page-container mt-12 space-y-8">
        {processStages.map((stage) => (
          <section key={stage.slug} id={stage.slug} aria-labelledby={`${stage.slug}-title`} className="reveal scroll-mt-28 overflow-hidden rounded-[1.75rem] border border-border bg-card">
            <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[0.9fr_1.6fr]">
              <div>
                <span className="display block text-7xl leading-none text-terracotta tabular-nums">{String(stage.number).padStart(2, "0")}</span>
                <h2 id={`${stage.slug}-title`} className="display mt-6 text-3xl leading-tight text-ink sm:text-4xl">{stage.title}</h2>
                <p className="mt-3 inline-flex rounded-full bg-terracotta-soft px-3 py-1 text-sm font-semibold text-terracotta-deep">{stage.timing}</p>
                <p className="mt-5 leading-relaxed text-muted">{stage.summary}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-primary uppercase">What we do</h3>
                  <CheckList items={stage.weDo} className="mt-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-terracotta-deep uppercase">What you do</h3>
                  <CheckList items={stage.youDo} className="mt-4 [&_svg]:text-terracotta" />
                  <div className="mt-8 rounded-xl bg-paper-deep/80 p-4">
                    <p className="text-xs font-bold tracking-wide text-muted uppercase">You finish with</p>
                    <p className="mt-1.5 text-[0.9375rem] font-semibold text-ink">{stage.outcome}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border bg-paper-deep/40 px-7 py-4 text-sm sm:px-10">
              <span className="text-muted">Official sources:</span>
              {stage.sources.map((id) => (
                <a key={id} href={sources[id].url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-deep">
                  {sources[id].label} <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      <CtaSection title="Ready for stage one?" />
    </>
  );
}
