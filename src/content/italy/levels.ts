/**
 * Study levels in Italy for applicants from India. Requirements vary by
 * programme; this text explains the general structure only.
 */

export type LevelSlug = "bachelors" | "masters" | "phd";

export type StudyLevel = {
  slug: LevelSlug;
  title: string;
  italianName: string;
  duration: string;
  headline: string;
  summary: string;
  eligibility: string[];
  admissions: string[];
  watchOuts: string[];
  documents: string[];
};

export const studyLevels: StudyLevel[] = [
  {
    slug: "bachelors",
    title: "Bachelor's degrees",
    italianName: "Laurea (and single-cycle Laurea Magistrale)",
    duration: "3 years (single-cycle programmes such as medicine: 5–6 years)",
    headline: "After Class 12: three-year bachelor's degrees, many taught in English.",
    summary:
      "Italian bachelor's degrees take three years. Some fields — medicine, dentistry, architecture, law — run as single-cycle programmes of five or six years with their own national admission rules.",
    eligibility: [
      "Italy generally requires 12 years of schooling for bachelor's entry — Class 12 from a recognised Indian board fits this.",
      "Each programme sets its own subject and grade requirements.",
      "English-taught programmes require proof of English, usually at B2 level or above.",
    ],
    admissions: [
      "Many universities run a pre-evaluation of your marks before formal application.",
      "Some programmes use entrance tests (for example TOLC or SAT-based routes); limited-enrolment programmes publish separate calls.",
      "Medicine and other restricted programmes follow national rules that have changed recently — we confirm the current route for each programme.",
    ],
    watchOuts: [
      "Limited-enrolment programmes often close earlier than the general Universitaly deadline.",
      "Your Class 10 and 12 certificates both need attestation and apostille.",
    ],
    documents: ["Passport", "Class 10 and 12 certificates and marksheets (attested and apostilled)", "English test result", "Statement of purpose", "Universitaly pre-enrolment summary", "DOV or CIMEA statement where required"],
  },
  {
    slug: "masters",
    title: "Master's degrees",
    italianName: "Laurea Magistrale",
    duration: "2 years",
    headline: "After your bachelor's: two-year master's degrees matched to your coursework.",
    summary:
      "Italian master's admissions focus on how closely your bachelor's subjects match the programme. Many accept three-year Indian bachelor's degrees; some ask for specific credits in core subjects. We map your transcript against each programme before you apply.",
    eligibility: [
      "A recognised bachelor's degree. Three-year and four-year Indian degrees are assessed programme by programme.",
      "Coursework in specific subject areas, often expressed as minimum credits (CFU) in core topics.",
      "English at the level set by the programme, usually B2 or above.",
    ],
    admissions: [
      "Applications are made on each university's own portal, often in more than one round.",
      "Some programmes interview shortlisted applicants or ask for a portfolio.",
      "Admission letter → Universitaly pre-enrolment → DOV or CIMEA → visa.",
    ],
    watchOuts: [
      "Applying to programmes that don't match your coursework is the most common reason for rejection.",
      "Final-year students may apply with provisional documents; check each university's rule.",
    ],
    documents: ["Passport", "Bachelor's degree and marksheets (attested and apostilled)", "English test result", "CV and statement of purpose", "Recommendation letters where requested", "Universitaly pre-enrolment summary", "DOV or CIMEA statement where required"],
  },
  {
    slug: "phd",
    title: "PhD and research",
    italianName: "Dottorato di Ricerca",
    duration: "Usually 3 years",
    headline: "Doctoral calls, research proposals and funded positions.",
    summary:
      "Italian PhDs are filled through public calls (bandi) published by each university, often with a funded scholarship. Selection is usually by research proposal, CV and interview. The visa route and DOV category differ from taught degrees.",
    eligibility: [
      "A master's degree, or one expected before the PhD starts.",
      "Research experience and a proposal aligned with the programme's themes.",
      "English or Italian at the level set by the call.",
    ],
    admissions: [
      "Calls usually open in spring and summer; each lists its funded positions and deadlines.",
      "Selection is typically by documents followed by an online interview.",
      "PhD applicants use the paid DOV category at the Italian mission.",
    ],
    watchOuts: [
      "Calls are published in Italian and English with short deadlines — tracking them early matters.",
      "Research proposals must fit the programme's stated areas.",
    ],
    documents: ["Passport", "Master's degree and marksheets (attested and apostilled)", "Research proposal", "CV and publications, if any", "Recommendation letters", "DOV (paid category) or CIMEA statement"],
  },
];

export function getLevel(slug: string): StudyLevel | undefined {
  return studyLevels.find((l) => l.slug === slug);
}
