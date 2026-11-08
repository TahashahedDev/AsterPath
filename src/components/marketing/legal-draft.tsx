import { Badge } from "@/components/ui/badge";

/** Shared layout for legal pages that are drafts awaiting legal review. */
export function LegalDraft({ title, intro, sections }: { title: string; intro: string; sections: { heading: string; body: string[] }[] }) {
  return (
    <article className="page-container max-w-3xl py-16 sm:py-24">
      <Badge tone="warning">Draft — pending legal review</Badge>
      <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{title}</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">{intro}</p>
      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-relaxed text-ink-soft">{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
