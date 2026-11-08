import { SectionHeading } from "@/components/ui/section-heading";

export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="hairline-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="page-container relative py-16 sm:py-24">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} className="max-w-3xl motion-safe:animate-rise" />
        {children && <div className="mt-8 motion-safe:animate-rise motion-safe:[animation-delay:120ms]">{children}</div>}
      </div>
    </section>
  );
}
