import type { Metadata } from "next";
import { LegalDraft } from "@/components/marketing/legal-draft";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that will govern AsterPath services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalDraft
      title="Terms of service"
      intro="Our full terms — including refund and cancellation policies — are being prepared with a legal adviser and will be published here before we accept any payment. In the meantime, these are the principles they will follow."
      sections={[
        {
          heading: "Guidance, not guarantees",
          body: [
            "AsterPath provides guidance and preparation support. Admission decisions are made by universities, and visa and permit decisions by government authorities. We do not guarantee admission, scholarships, employment or visa outcomes.",
          ],
        },
        {
          heading: "Written agreements",
          body: [
            "Before any payment, you will receive a written agreement setting out exactly which services are included, the price, the milestone schedule and the refund and cancellation terms.",
          ],
        },
        {
          heading: "Third-party costs",
          body: [
            "University, government, visa centre, translation, apostille, legalisation, courier, insurance and travel costs are separate from our fees and are paid to the relevant third party. We show these upfront wherever we coordinate them.",
          ],
        },
        {
          heading: "Information on this website",
          body: [
            "Country information on this site is general guidance. Each page shows when it was last reviewed. Always confirm requirements with the official sources listed, which take precedence.",
          ],
        },
      ]}
    />
  );
}
