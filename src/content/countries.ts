/**
 * Destination content — Phase 1 seed.
 *
 * This file is temporary: in Phase 7 these records move into the knowledge base
 * (knowledge_entries / knowledge_sources) with reviewer, version and status.
 * Until an AsterPath reviewer verifies each entry against its official source,
 * `review.status` stays "draft" and the site says so plainly.
 *
 * Only well-established, procedure-level facts appear here. Specific figures
 * (fees, deadlines, fund amounts, processing times) are intentionally omitted
 * because they change and must come from a reviewed source.
 */

export type CountrySlug = "italy" | "germany" | "france";

export type KnowledgeReview = {
  status: "draft" | "awaiting-review" | "published";
  lastReviewedOn: string | null; // ISO date
  reviewer: string | null;
};

export type OfficialSource = {
  label: string;
  url: string;
  description: string;
};

export type CountryProcedure = {
  title: string;
  description: string;
};

export type Country = {
  slug: CountrySlug;
  name: string;
  capital: { name: string; coordinates: [lon: number, lat: number] };
  headline: string;
  summary: string;
  studyHighlights: string[];
  procedures: CountryProcedure[];
  commonDocuments: string[];
  languageNote: string;
  scholarshipNote: string;
  arrivalNote: string;
  sources: OfficialSource[];
  review: KnowledgeReview;
};

const unreviewed: KnowledgeReview = { status: "draft", lastReviewedOn: null, reviewer: null };

export const countries: Country[] = [
  {
    slug: "italy",
    name: "Italy",
    capital: { name: "Rome", coordinates: [12.4964, 41.9028] },
    headline: "Historic universities, a growing range of English-taught degrees.",
    summary:
      "Italy combines centuries-old public universities with modern English-taught bachelor's and master's programmes. For many students from India, the process involves a university application, a national pre-enrolment step, and a study visa application with the Italian consular network.",
    studyHighlights: [
      "Public universities with English-taught programmes across engineering, design, economics and the sciences",
      "Tuition at public universities is often linked to family income — we help you understand what applies to you",
      "Regional student support schemes exist in many regions, each with its own rules and timelines",
    ],
    procedures: [
      {
        title: "University application",
        description:
          "Each university runs its own admissions portal, intake calendar and document checklist. Some programmes evaluate your academic record before you apply formally.",
      },
      {
        title: "Universitaly pre-enrolment",
        description:
          "Students applying for a study visa typically complete a pre-enrolment request on the national Universitaly portal, which the university then validates.",
      },
      {
        title: "Declaration of value or equivalent",
        description:
          "Universities may ask for an official evaluation of your previous qualifications. The accepted route differs by university — we confirm which one applies before you pay for anything.",
      },
      {
        title: "Study visa application",
        description:
          "Applications go through the Italian consular network and its appointed visa centres. Requirements depend on your course and circumstances.",
      },
    ],
    commonDocuments: [
      "Passport",
      "Academic transcripts and degree certificates",
      "Language test results, where required",
      "CV and statement of purpose",
      "Proof of financial means",
      "Accommodation and insurance documents for the visa stage",
    ],
    languageNote:
      "English-taught programmes usually require an English proficiency result. Italian-taught programmes require Italian proficiency at the level set by the university.",
    scholarshipNote:
      "Scholarship and fee-reduction schemes are run by universities and regional bodies, with separate calls and deadlines. We help you identify which calls you may be eligible for — awards are decided by the issuing body.",
    arrivalNote:
      "After arrival, international students generally complete local registration steps, including a residence permit application within the period set by Italian law.",
    sources: [
      {
        label: "Universitaly",
        url: "https://www.universitaly.it",
        description: "National portal for pre-enrolment of international students.",
      },
      {
        label: "Visto per l'Italia",
        url: "https://vistoperitalia.esteri.it",
        description: "Ministry of Foreign Affairs visa information portal.",
      },
      {
        label: "Study in Italy",
        url: "https://studyinitaly.esteri.it",
        description: "Official information portal for international students.",
      },
    ],
    review: unreviewed,
  },
  {
    slug: "germany",
    name: "Germany",
    capital: { name: "Berlin", coordinates: [13.405, 52.52] },
    headline: "Research-led universities with a structured application system.",
    summary:
      "Germany offers a wide range of programmes at public universities and universities of applied sciences. Applicants from India typically complete an academic document verification step before applying, and many universities process applications through a central service.",
    studyHighlights: [
      "Strong research universities and practice-oriented universities of applied sciences",
      "Many public universities charge low or no tuition, though semester contributions and regional rules apply",
      "A growing number of English-taught master's programmes",
    ],
    procedures: [
      {
        title: "APS academic verification",
        description:
          "Indian applicants to German universities generally need an APS certificate, which verifies academic documents before university applications and the visa stage.",
      },
      {
        title: "University applications",
        description:
          "Some universities accept direct applications; many process international applications through uni-assist. Each programme sets its own entry requirements.",
      },
      {
        title: "Proof of financial resources",
        description:
          "Study visa applicants must show how they will fund their stay — commonly through a blocked account or an accepted alternative. The required amount is set by the German authorities and updated periodically.",
      },
      {
        title: "Student visa application",
        description:
          "Applications are made through the German missions in India and their appointed service providers.",
      },
    ],
    commonDocuments: [
      "Passport",
      "APS certificate",
      "Academic transcripts and degree certificates",
      "Language test results (English and/or German)",
      "CV and motivation letter",
      "Proof of financial resources and health insurance",
    ],
    languageNote:
      "English-taught programmes require proof of English. German-taught programmes require recognised German certificates at the level set by the university. Some German knowledge helps day-to-day life regardless.",
    scholarshipNote:
      "Scholarships are offered by organisations such as DAAD, foundations and universities themselves. Eligibility and deadlines vary — we help you prepare, the funder decides.",
    arrivalNote:
      "After arrival, students register their address locally and apply for a residence permit at the local foreigners' authority.",
    sources: [
      {
        label: "APS India",
        url: "https://aps-india.de",
        description: "Academic Evaluation Centre at the German Embassy in New Delhi.",
      },
      {
        label: "DAAD",
        url: "https://www.daad.de/en/",
        description: "German Academic Exchange Service — study and scholarship information.",
      },
      {
        label: "uni-assist",
        url: "https://www.uni-assist.de/en/",
        description: "Application service used by many German universities.",
      },
      {
        label: "German Missions in India",
        url: "https://india.diplo.de",
        description: "Official visa information from the German Embassy and Consulates.",
      },
    ],
    review: unreviewed,
  },
  {
    slug: "france",
    name: "France",
    capital: { name: "Paris", coordinates: [2.3522, 48.8566] },
    headline: "Universities and grandes écoles, with a national application pathway.",
    summary:
      "France has public universities, specialised schools and grandes écoles, with programmes taught in French and English. Students from India usually follow the Campus France procedure, which connects academic applications with the visa process.",
    studyHighlights: [
      "Public universities with regulated tuition, plus selective schools with their own fees",
      "English-taught master's programmes in business, engineering and the sciences",
      "A national procedure that links your applications to the visa stage",
    ],
    procedures: [
      {
        title: "Campus France — Études en France",
        description:
          "Students resident in India generally create an Études en France file, submit applications to participating institutions and complete a Campus France interview.",
      },
      {
        title: "Direct school applications",
        description:
          "Some schools and programmes run their own admissions alongside or outside the national platform. We confirm the right route for each programme.",
      },
      {
        title: "Student visa application",
        description:
          "Once admitted, the visa application is made through France-Visas and the appointed visa centre.",
      },
      {
        title: "Arrival validation",
        description:
          "Long-stay student visas usually need to be validated online after arrival, within the time limit stated on the visa.",
      },
    ],
    commonDocuments: [
      "Passport",
      "Academic transcripts and degree certificates",
      "Language test results (English and/or French)",
      "CV and statement of purpose",
      "Proof of financial means",
      "Admission letter and accommodation details for the visa stage",
    ],
    languageNote:
      "English-taught programmes require proof of English. French-taught programmes generally require a recognised French test such as DELF/DALF or TCF at the level set by the institution.",
    scholarshipNote:
      "Scholarships exist from the French government, the French Embassy in India, regions and institutions. Each has its own criteria and calendar.",
    arrivalNote:
      "After arrival, students validate their visa online and register with their institution and, where applicable, the French health insurance system.",
    sources: [
      {
        label: "Campus France India",
        url: "https://www.inde.campusfrance.org",
        description: "Official Campus France office for students in India.",
      },
      {
        label: "France-Visas",
        url: "https://france-visas.gouv.fr",
        description: "Official visa portal of the French government.",
      },
      {
        label: "Campus France",
        url: "https://www.campusfrance.org/en",
        description: "National agency for higher education promotion and international mobility.",
      },
    ],
    review: unreviewed,
  },
];

export function getCountry(slug: string): Country | undefined {
  return countries.find((country) => country.slug === slug);
}

/** Origin for the hero route visual: New Delhi. */
export const originCity = { name: "New Delhi", coordinates: [77.209, 28.6139] as [number, number] };
