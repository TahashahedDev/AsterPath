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
    description: "The competent state education department verifies your degree and marksheets. Italian missions require this for DOV — attestation by an SDM is not accepted.",
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
    description: "The DOV describes your qualification for Italian universities and is issued by the mission covering the state where your degree was issued. CIMEA's statement can replace it where your university accepts it.",
    when: "After admission and Universitaly pre-enrolment",
  },
];

export const commonDocuments = [
  { name: "Passport", note: "Valid well beyond your intended stay, with your name spelt exactly as on your certificates." },
  { name: "Class 10 and 12 certificates and marksheets", note: "Attested and apostilled for bachelor's applicants; often requested for master's too." },
  { name: "Degree certificate and transcripts", note: "Attested and apostilled. Provisional certificates are accepted only in specific cases." },
  { name: "English test result", note: "As required by each programme — usually B2 or above." },
  { name: "Statement of purpose and CV", note: "Written by you, reviewed with us." },
  { name: "Recommendation letters", note: "Where the programme asks for them." },
  { name: "Universitaly pre-enrolment summary", note: "Generated after your university validates your pre-enrolment." },
  { name: "Proof of funds", note: "For the visa — meeting the current annual minimum." },
  { name: "Accommodation and health insurance", note: "For the visa application." },
  { name: "ISEE parificato documents", note: "Only if applying for a regional DSU scholarship — legalised and translated." },
];
