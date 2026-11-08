import type { Metadata } from "next";
import { serviceCategories, services, type ServiceCategory } from "@/content/services";
import { ServiceCard } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Services — admissions, visas, documents and more",
  description: "University selection, applications, enrolment, study visa preparation, scholarships, translation and apostille coordination, and arrival support.",
  alternates: { canonical: "/services" },
};

const order: ServiceCategory[] = ["study", "documents", "work", "support"];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={<>Everything we do, <span className="serif-accent text-primary">and who actually does it.</span></>}
        description="Some services we deliver ourselves. Some are performed by qualified partners or decided by authorities — we say which, every time."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="primary">Delivered by AsterPath</Badge>
          <Badge tone="gold">Via authorised partners</Badge>
          <Badge>Decided by authorities</Badge>
        </div>
      </PageHero>

      {order.map((category) => {
        const items = services.filter((s) => s.category === category);
        return (
          <section key={category} className="page-container mt-20" aria-labelledby={`category-${category}`}>
            <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 id={`category-${category}`} className="text-2xl font-semibold tracking-tight">{serviceCategories[category].label}</h2>
              <p className="text-muted">{serviceCategories[category].description}</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((service) => (
                <div key={service.slug} className="reveal">
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <CtaSection />
    </>
  );
}
