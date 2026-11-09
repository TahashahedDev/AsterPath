import { SectionHeading } from "@/components/ui/section-heading";

export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="atmosphere relative overflow-hidden border-b border-border">
      <div className="page-container relative py-16 sm:py-24">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} className="max-w-3xl motion-safe:animate-rise" />
        {children && <div className="mt-10 motion-safe:animate-rise motion-safe:[animation-delay:120ms]">{children}</div>}
      </div>
    </section>
  );
}
