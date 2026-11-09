import type { SourceId } from "@/content/italy/sources";

/**
 * Figures and rules that change over time. Each carries its source so the page
 * can show where it came from. Update here only, never in components.
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
    "The DOV is requested from the Italian mission covering the Indian state where your degree or school certificate was issued. Your visa is requested where you live, which can be a different office.",
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
  "Biometrics are taken in person; group or agent submission of fingerprints is no longer possible.",
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
    "International students prove family income and assets with an ISEE parificato. It needs documents from India, apostilled and translated, so preparation should start months before the application window.",
  timing: "Most regional calls open in summer (around July) and close in late summer or early autumn. Each region sets its own dates.",
};

export const maeciScholarship = {
  summary:
    "The Italian Ministry of Foreign Affairs offers government scholarships to foreign students. The call is usually published early in the year; the 2026/27 call closed on 26 March 2026.",
  sourceId: "studyInItaly" as SourceId,
};

/** Official 2026/27 checklist (Bengaluru consulate), grouped as a student gathers it. */
export const visaChecklist = {
  lastDates: [
    { intake: "2026/27", date: "30 November 2026" },
    { intake: "2027/28", date: "31 October 2027" },
  ],
  appointmentRule: "Book the visa appointment with your own email address and phone number. The consulate discourages agents in the application itself, so we prepare and check your file and you apply in person.",
  groups: [
    {
      title: "Passport and forms",
      items: [
        "Passport issued in the last 10 years, valid at least 3 months beyond the visa, with 2 blank pages",
        "Proof of residence in the consulate's states for the last 6 months, if your passport address is elsewhere",
        "Visa application form, signed, and 2 recent photographs on white",
        "Copies of visas issued, and any refusals, in the last 10 years",
      ],
    },
    {
      title: "Admission and education",
      items: [
        "Universitaly pre-enrolment summary, 2 copies (or an admission letter for courses not on Universitaly)",
        "Receipt of the enrolment fee, visible on your own bank statement",
        "Final degree or school certificate and marksheets, attested by the state Higher Education Department and apostilled, with colour copies",
        "CIMEA statement or Declaration of Value, if your university requires one",
        "CV (one page) and a cover letter (recommended)",
      ],
    },
    {
      title: "Money and insurance",
      items: [
        "Proof of funds of at least €10,179.85 a year",
        "Your original 6-month bank statement, signed and stamped by the branch on every page",
        "Proof of income: ITR for 2 years, a state family income certificate, or an education loan shown on your statements",
        "If a sponsor pays: their 6-month statement, ID, sponsorship letter and proof of income (relatives up to the fourth degree)",
        "Medical insurance for at least one year, with no limit on urgent hospital care",
      ],
    },
    {
      title: "Travel and language",
      items: [
        "Confirmed one-way flight reservation (the PNR is checked), plus funds on top of the minimum",
        "Accommodation for at least your first 30 days in Italy",
        "B2 English certificate, or a Medium of Instruction letter, for courses taught in English",
      ],
    },
  ],
  minors: [
    "Birth certificate, attested and apostilled",
    "Affidavit signed by both parents before a notary and apostilled, or a declaration signed at the consulate",
    "A letter from the guardian in Italy accepting guardianship, with their ID",
  ],
  sourceId: "visaChecklistBengaluru" as SourceId,
};

/** National DSU minimums for 2026/27, set each year by the Ministry. Regions may pay more. */
export const dsu2026 = {
  year: "2026/27",
  amounts: [
    { label: "Living away from home", eur: 7_171.11 },
    { label: "Commuting", eur: 4_190.71 },
    { label: "Living at home", eur: 2_890.16 },
  ],
  iseeLimitEur: 28_339.88,
  ispeLimitEur: 61_608.48,
  sources: ["murDsu"] as SourceId[],
};

/** What an Indian family gathers for the ISEE parificato (India is in group B: apostille plus Italian translation). */
export const iseeDocuments = {
  rule: "Issued by the competent Indian authority, apostilled, and translated into Italian by a certified translator.",
  referenceYear: "For 2026/27, income is for calendar year 2024 and assets are as at 31 December 2024.",
  items: [
    { title: "Family composition", body: "A current certificate listing every family member, with dates of birth and relationship." },
    { title: "Income of each member", body: "All income for the reference year. Where the tax year runs April to March, monthly payslips covering January to December." },
    { title: "Property", body: "Every property owned by the family, with its size; property abroad is valued at €500 per square metre. If you rent, the current rental contract." },
    { title: "Bank accounts and investments", body: "Year-end balance and average yearly balance of every account, plus the value of deposits, shares and insurance policies." },
    { title: "Special circumstances", body: "Death or divorce certificates where they apply, and any scholarship received in the reference year." },
  ],
  sourceId: "iseeDocs" as SourceId,
};

export const entranceTests = [
  {
    name: "CEnT-S",
    who: "CISIA",
    body: "The English-language test for many bachelor's programmes in engineering, economics, pharmacy and sciences. It replaced the English TOLC tests in November 2025, runs in four windows a year, at home or at a university, and one result counts for every university that uses it.",
    sourceId: "cisia" as SourceId,
  },
  {
    name: "SAT and university tests",
    who: "Each university",
    body: "Some universities accept SAT scores or run their own entrance test or interview. Each admission call says which, so we confirm it programme by programme.",
    sourceId: "universitaly" as SourceId,
  },
  {
    name: "Medicine and limited-enrolment programmes",
    who: "National rules",
    body: "Admission to medicine, dentistry and other limited-enrolment programmes follows national rules that have changed recently. We work from the current call for each programme.",
    sourceId: "mur" as SourceId,
  },
];
