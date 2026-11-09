import type { SourceId } from "@/content/italy/sources";

/**
 * Figures and rules that change over time. Each carries its source so the page
 * can show where it came from. Update here only — never hardcode in components.
 */

export const visaFunds = {
  /** Minimum means of support for a study visa, per academic year. */
  annualEur: 10_179.85,
  appliesTo: "2026/27 and 2027/28 academic years",
  previousAnnualEur: 6_947.33,
  note: "Excludes tuition and accommodation. Cash is not accepted as proof.",
  sources: ["vistoPerItalia", "consulateMumbai"] as SourceId[],
};

export const dovRules = {
  maxProcessingDays: 90,
  points: [
    "The DOV is requested from the Italian mission covering the Indian state where your degree or school certificate was issued. Your visa is requested where you live — these can be different offices.",
    "Degree certificate and marksheets must be attested by the competent state Higher Education Department, then apostilled by the Ministry of External Affairs (or online through e-Sanad).",
    "Attestation by an SDM is not accepted for study documents.",
    "Documents issued in English do not need an Italian translation for the DOV.",
    "If your name differs across certificates or your passport, an attested and apostilled “One and the same name” certificate is required. Affidavits and self-declarations are not accepted.",
    "A free DOV for study needs your admission letter and Universitaly pre-enrolment summary. PhD, research, or applications without pre-enrolment use the paid DOV category.",
    "A CIMEA Statement of Verification and Comparability can replace the DOV where your Italian university accepts it.",
  ],
  sources: ["dovChecklistMumbai", "cimea", "meaApostille"] as SourceId[],
};

export type ItalianMission = {
  name: string;
  city: string;
  coordinates: [lon: number, lat: number];
  jurisdiction: string;
  sourceId: SourceId;
  confirmed: boolean;
};

export const italianMissionsInIndia: ItalianMission[] = [
  {
    name: "Embassy of Italy",
    city: "New Delhi",
    coordinates: [77.209, 28.6139],
    jurisdiction: "Delhi, Chandigarh, Haryana, Punjab, Rajasthan, Jammu & Kashmir, Himachal Pradesh, Uttar Pradesh",
    sourceId: "embassyDelhi",
    confirmed: true,
  },
  {
    name: "Consulate General of Italy",
    city: "Mumbai",
    coordinates: [72.8777, 19.076],
    jurisdiction: "Maharashtra, Gujarat, Goa, Madhya Pradesh, Chhattisgarh, Kerala, Daman & Diu, Dadra & Nagar Haveli",
    sourceId: "consulateMumbai",
    confirmed: true,
  },
  {
    name: "Consulate General of Italy",
    city: "Bengaluru",
    coordinates: [77.5946, 12.9716],
    jurisdiction: "Karnataka, Tamil Nadu, Telangana, Andhra Pradesh, Puducherry",
    sourceId: "consulateBengaluru",
    confirmed: true,
  },
  {
    name: "Consulate General of Italy",
    city: "Kolkata",
    coordinates: [88.3639, 22.5726],
    jurisdiction: "Eastern and north-eastern states",
    sourceId: "consulateKolkata",
    confirmed: false,
  },
];

export const visaRules = [
  "Programmes longer than 90 days need a national (Type D) study visa.",
  "Biometrics are taken in person — group or agent submission of fingerprints is no longer possible.",
  "Allow up to 90 days for a decision. Missions publish a last date for each intake; for 2026/27 bachelor's and master's enrolment, the Kolkata consulate's cut-off was 30 November 2026.",
  "English-taught programmes generally expect English at B2 level or above.",
];

export const afterGraduation = {
  summary:
    "After completing a degree in Italy, non-EU graduates can apply to convert their study permit into a job-seeker permit (permesso per attesa occupazione) of up to 12 months, which can later be converted into a work permit.",
  note: "This is guidance on official routes only. AsterPath does not provide job placement.",
};

export const dsuBasics = {
  summary:
    "DSU (Diritto allo Studio Universitario) grants are means-tested support run by each region. Depending on the region and your family's income and assets, they can include a cash grant, a place in student housing, subsidised meals and a tuition fee exemption.",
  isee:
    "International students prove family income and assets with an ISEE parificato. It needs documents from India — legalised and translated — so preparation should start months before the application window.",
  timing: "Most regional calls open in summer (around July) and close in late summer or early autumn. Each region sets its own dates.",
};

export const maeciScholarship = {
  summary:
    "The Italian Ministry of Foreign Affairs offers government scholarships to foreign students. The call is usually published early in the year; the 2026/27 call closed on 26 March 2026.",
  sourceId: "studyInItaly" as SourceId,
};
