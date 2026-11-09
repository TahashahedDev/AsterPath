import type { Metadata } from "next";
import { CONTENT_CHECKED_ON } from "@/content/italy/sources";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Important information about AsterPath's guidance, independence and the information on this website.",
  alternates: { canonical: "/legal/disclaimer" },
};

const sections: LegalSection[] = [
  {
    id: "independent",
    heading: "We are independent",
    body: [
      <p key="a">
        AsterPath is a private consultancy. We are not affiliated with, endorsed by or acting on behalf of the Government of Italy, the Italian Ministry of
        Foreign Affairs or Ministry of University and Research, any Italian embassy or consulate, Universitaly, CIMEA, Uni-Italia, any visa application
        centre, any regional scholarship body or any university.
      </p>,
    ],
  },
  {
    id: "no-guarantee",
    heading: "No guarantees",
    body: [
      <p key="a">
        Universities decide admissions, awarding bodies decide scholarships and the Italian authorities decide visas and permits. We do not guarantee any
        of these outcomes.
      </p>,
    ],
  },
  {
    id: "information",
    heading: "Information on this website",
    body: [
      <p key="a">
        Our guidance is general and is compared against official sources, which we link. It was last checked on {CONTENT_CHECKED_ON}. Requirements,
        fees and deadlines change, sometimes without notice. Always rely on the official source and on the advice we give you for your specific case.
        Nothing on this website is legal advice.
      </p>,
    ],
  },
  {
    id: "maps",
    heading: "Maps",
    body: [
      <p key="a">
        Maps are illustrative. Country boundaries are drawn from Natural Earth&rsquo;s India point-of-view dataset; Italian regional boundaries from ISTAT
        via openpolis (CC BY 4.0).
      </p>,
    ],
  },
  {
    id: "links",
    heading: "External links and names",
    body: [
      <p key="a">
        Links to external websites are provided for convenience; we are not responsible for their content. Names of institutions and programmes belong
        to their respective owners and are used only to identify them.
      </p>,
    ],
  },
];

export default function DisclaimerPage() {
  return <LegalPage title="Disclaimer" version="draft-2026-11" intro={<p>Please read this before relying on any information on this website.</p>} sections={sections} />;
}
