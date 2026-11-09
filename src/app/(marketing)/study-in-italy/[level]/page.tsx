import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getLevel, studyLevels } from "@/content/italy/levels";
import { processStages } from "@/content/italy/process";
import { CheckList, ReviewStatus, SourceNote } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { ButtonLink } from "@/components/ui/button";

type Props = { params: Promise<{ level: string }> };

const ctaNoun: Record<string, string> = { bachelors: "a bachelor's degree", masters: "a master's degree", phd: "a PhD" };

export const dynamicParams = false;

export function generateStaticParams() {
  return studyLevels.map((l) => ({ level: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const level = getLevel((await params).level);
  if (!level) return {};
  return {
    title: `${level.title} in Italy for Indian students`,
    description: level.summary,
    alternates: { canonical: `/study-in-italy/${level.slug}` },
  };
}

export default async function LevelPage({ params }: Props) {
  const level = getLevel((await params).level);
  if (!level) notFound();

  const blocks = [
    { title: "Who is eligible", items: level.eligibility },
    { title: "How admission works", items: level.admissions },
  ];

  return (
    <>
      <section className="atmosphere relative overflow-hidden border-b border-border">
        <div className="page-container relative py-16 sm:py-24">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href="/study-in-italy" className="hover:text-ink">Study in Italy</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span aria-current="page" className="text-ink">{level.title}</span>
          </nav>
          <p className="mt-8 text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase motion-safe:animate-rise">
            {level.italianName} · {level.duration}
          </p>
          <h1 className="display mt-4 max-w-4xl text-[2.75rem] leading-[1.02] text-ink motion-safe:animate-rise sm:text-6xl lg:text-7xl">{level.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted motion-safe:animate-rise sm:text-xl">{level.summary}</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href={`/contact?level=${level.slug}`} size="lg">Book a free consultation</ButtonLink>
            <ReviewStatus />
          </div>
        </div>
      </section>

      <section className="page-container mt-16 grid gap-6 lg:grid-cols-2">
        {blocks.map((block) => (
          <div key={block.title} className="reveal rounded-[var(--radius-card)] border border-border bg-card p-7 sm:p-9">
            <h2 className="display text-3xl text-ink">{block.title}</h2>
            <CheckList items={block.items} className="mt-6" />
          </div>
        ))}
      </section>

      <section className="page-container mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="reveal rounded-[var(--radius-card)] border border-border bg-paper-deep/70 p-7 sm:p-9">
          <h2 className="display text-3xl text-ink">Documents you will need</h2>
          <p className="mt-3 text-[0.9375rem] text-muted">Your personal checklist depends on the programme and university.</p>
          <CheckList items={level.documents} className="mt-6" />
          <Link href="/documents" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-primary-deep">
            How attestation, apostille and DOV work →
          </Link>
        </div>
        <div className="reveal rounded-[var(--radius-card)] border border-warning-border bg-warning-bg p-7 sm:p-9">
          <h2 className="flex items-center gap-3 text-lg font-bold text-warning-fg">
            <AlertTriangle className="size-5" aria-hidden="true" /> Watch out for
          </h2>
          <ul className="mt-5 space-y-4">
            {level.watchOuts.map((w) => (
              <li key={w} className="text-[0.9375rem] leading-relaxed text-warning-fg">{w}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-container mt-24">
        <h2 className="display text-4xl text-ink">How we take you through it</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {processStages.map((stage) => (
            <li key={stage.slug} className="rounded-[var(--radius-card)] border border-border bg-card p-6">
              <span className="display text-4xl text-terracotta tabular-nums">{String(stage.number).padStart(2, "0")}</span>
              <h3 className="mt-4 font-bold text-ink">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{stage.outcome}</p>
            </li>
          ))}
        </ol>
        <SourceNote ids={["universitaly", "studyInItaly", "cimea"]} className="mt-10" />
      </section>

      <CtaSection title={`Planning ${ctaNoun[level.slug]} in Italy?`} />
    </>
  );
}
