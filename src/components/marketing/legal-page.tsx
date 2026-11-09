import { AlertTriangle } from "lucide-react";
import { legalEntity } from "@/config/site";

export type LegalSection = { id: string; heading: string; body: React.ReactNode[] };

/**
 * Shared layout for legal documents. While the business details are placeholders
 * or the text is unreviewed, a prominent banner says so.
 */
export function LegalPage({ title, version, intro, sections }: { title: string; version: string; intro: React.ReactNode; sections: LegalSection[] }) {
  return (
    <article className="page-container py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="display mt-5 text-[2.75rem] leading-[1.05] text-ink sm:text-6xl">{title}</h1>
        <p className="mt-4 text-sm text-muted">Version {version}</p>

        <div className="mt-8 flex gap-3 rounded-xl border border-warning-border bg-warning-bg p-5 text-[0.9375rem] leading-relaxed text-warning-fg" role="note">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-bold">Draft for legal review.</strong> This document must be reviewed by a qualified lawyer before AsterPath accepts any
            payment.{!legalEntity.confirmed && " Text in square brackets is a placeholder for business details still to be confirmed."}
          </p>
        </div>

        <div className="mt-10 text-lg leading-relaxed text-ink-soft">{intro}</div>

        <nav aria-label="Contents" className="mt-10 rounded-[var(--radius-card)] border border-border bg-card p-6">
          <h2 className="text-sm font-bold tracking-wide text-ink uppercase">Contents</h2>
          <ol className="mt-4 grid gap-2 text-[0.9375rem] sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-primary hover:text-primary-deep">
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-12">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="display text-2xl text-ink sm:text-3xl">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-ink-soft [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-2">
                {s.body.map((block, j) => (
                  <div key={j}>{block}</div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
