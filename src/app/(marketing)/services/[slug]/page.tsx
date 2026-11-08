import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info, MessageCircle } from "lucide-react";
import { getService, serviceCategories, services } from "@/content/services";
import { CheckList, FulfilmentBadge, ServiceCard } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { ServiceIcon } from "@/components/marketing/service-icon";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { serviceEnquiryMessage, whatsappUrl } from "@/lib/whatsapp";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const related = services.filter((s) => s.category === service.category && s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="hairline-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="page-container relative py-16 sm:py-24">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href="/services" className="hover:text-ink">Services</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span>{serviceCategories[service.category].label}</span>
          </nav>
          <div className="mt-8 flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
              <ServiceIcon name={service.icon} className="size-7" />
            </span>
            <FulfilmentBadge fulfilment={service.fulfilment} />
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-[-0.03em] sm:text-5xl">{service.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{service.description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg">Ask about this service</ButtonLink>
            <ExternalButtonLink href={whatsappUrl(serviceEnquiryMessage(service.title))} variant="secondary" size="lg">
              <MessageCircle aria-hidden="true" /> WhatsApp us
            </ExternalButtonLink>
          </div>
        </div>
      </section>

      <section className="page-container mt-16 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-7 sm:p-9">
          <h2 className="text-xl font-semibold tracking-tight">What&rsquo;s included</h2>
          <CheckList items={service.includes} className="mt-6" />
        </div>
        <div className="rounded-[var(--radius-card)] border border-border bg-paper-deep/60 p-7 sm:p-9">
          <h2 className="text-xl font-semibold tracking-tight">Good to know</h2>
          <ul className="mt-6 space-y-3">
            {service.limits.map((limit) => (
              <li key={limit} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-soft">
                <Info className="mt-1 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
                {limit}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-border pt-5 text-sm text-muted">
            <span className="font-medium text-ink">Who does the work: </span>
            {service.fulfilment.note}
          </p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="page-container mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">Related services</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.slug} service={s} compact />
            ))}
          </div>
        </section>
      )}

      <CtaSection whatsappMessage={serviceEnquiryMessage(service.title)} />
    </>
  );
}
