import { Plus } from "lucide-react";
import type { Faq } from "@/content/faqs";

/** Native <details> keeps the FAQ accessible and functional without JavaScript. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {faqs.map((faq) => (
        <details key={faq.question} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-5 text-left text-lg font-medium tracking-tight text-ink">
            {faq.question}
            <Plus className="size-5 shrink-0 text-subtle transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
          </summary>
          <p className="max-w-3xl pb-6 leading-relaxed text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
