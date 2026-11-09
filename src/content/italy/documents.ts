/**
 * The attestation and legalisation chain for Indian academic documents used in
 * Italy. Order matters: each step relies on the one before it.
 */

export type ChainStep = {
  title: string;
  who: string;
  description: string;
  when: string;
};

export const legalisationChain: ChainStep[] = [
  {
    title: "Notary",
    who: "A notary public",
    description: "Some states' attestation procedures ask for notarised copies first. Not every document or state needs this step.",
    when: "Only where your state's procedure requires it",
  },
  {
    title: "State HRD attestation",
    who: "Your state's Higher Education Department",
    description: "The competent state education department verifies your degree and marksheets. Italian missions require this; attestation by an SDM is not accepted.",
    when: "Always, for academic documents",
  },
  {
    title: "MEA apostille",
    who: "Ministry of External Affairs, Government of India",
    description: "The apostille makes the attested document valid for use in Italy. Digital documents can be apostilled online through e-Sanad.",
    when: "Always, after HRD attestation",
  },
  {
    title: "Translation",
    who: "A qualified translator",
    description: "Documents issued in English need no Italian translation for the DOV. Documents in other languages, and some documents for scholarships, need a certified Italian translation.",
    when: "Only for documents not issued in English, or where requested",
  },
  {
    title: "Declaration of Value or CIMEA",
    who: "Italian mission in India, or CIMEA",
    description: "Needed only if your university asks. The DOV is issued by the mission covering the state where your degree was issued; some universities accept only a CIMEA statement instead.",
    when: "After admission and Universitaly pre-enrolment",
  },
];

/** Documents by the stage at which you need them. Visa items follow the 2026/27 consulate checklist. */
export const documentStages = [
  {
    title: "Foundation",
    when: "Before anything else",
    items: [
      "Passport, issued in the last 10 years and valid well beyond your stay",
      "Class 10 and 12 certificates and marksheets",
      "Degree certificate and transcripts (for master's and PhD)",
      "A \u201cOne and the same name\u201d certificate, attested and apostilled, if your name differs anywhere",
    ],
  },
  {
    title: "Applications",
    when: "Winter to spring",
    items: [
      "English test result at B2 or above, or a Medium of Instruction letter where accepted",
      "CEnT-S, SAT or the university's own test, where the programme asks for one",
      "Statement of purpose and a one-page CV",
      "Recommendation letters, and a portfolio for design or architecture",
    ],
  },
  {
    title: "Recognition",
    when: "After your offer",
    items: [
      "Universitaly pre-enrolment summary, once your university validates it",
      "Declaration of Value or CIMEA statement, only if your university requires one",
      "Academic documents attested by the state Higher Education Department and apostilled by the MEA",
    ],
  },
  {
    title: "Scholarship",
    when: "Summer",
    items: [
      "ISEE parificato documents: family composition, income, property and bank balances",
      "Each apostilled and translated into Italian by a certified translator",
    ],
  },
  {
    title: "Arrival",
    when: "First days in Italy",
    items: [
      "Residence permit request within 8 working days of arrival, through the post office kit",
      "Passport, visa, insurance and enrolment proof for the residence permit",
      "Tax code (generated at pre-enrolment) and registration with your university",
    ],
  },
];
