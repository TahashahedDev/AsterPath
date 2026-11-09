export type Faq = { question: string; answer: string; topic: "general" | "pricing" | "process" | "scholarships" };

export const faqs: Faq[] = [
  {
    topic: "general",
    question: "Why only Italy?",
    answer:
      "Because one country done properly beats ten done superficially. Italy has its own systems: Universitaly, the Declaration of Value, regional scholarships, the ISEE parificato. Small mistakes there cost months, so we know them in detail.",
  },
  {
    topic: "general",
    question: "Do you guarantee admission or a visa?",
    answer:
      "No. Universities decide admissions and the Italian consulate decides visas. Anyone who guarantees either is not being honest with you. We guarantee our own work: complete, checked applications and files, ready on time.",
  },
  {
    topic: "general",
    question: "What does one advisor, no ghosting, mean?",
    answer:
      "One named advisor owns your file from the first call to your arrival. We reply within one working day and send weekly updates during active stages. We take a limited number of students each intake so that this stays true.",
  },
  {
    topic: "pricing",
    question: "What does the plan include?",
    answer:
      "Everything we do, and the costs along the way: the English test fee, university application fees, notary, attestation, apostille, translations, CIMEA or a paid DOV, ISEE translations, visa insurance and couriers. The enrolment fee, visa fee and residence permit fee are credited back, because you must pay those yourself.",
  },
  {
    topic: "pricing",
    question: "Why don't you publish a price?",
    answer:
      "Because the costs inside the plan depend on you: how many documents need attesting, which test, which universities. You get one written figure after the free consultation, before you pay anything, and it does not change.",
  },
  {
    topic: "pricing",
    question: "Do I pay everything upfront?",
    answer:
      "No. You pay in instalments as each stage starts: onboarding, applications, admission, visa and arrival. Your written agreement sets every amount and date.",
  },
  {
    topic: "process",
    question: "When should I start for a September intake?",
    answer:
      "Ten to twelve months before. Attestation takes weeks, English tests may need a retake, applications open in winter and a DOV can take up to 90 days. We aim to file your visa before the June to September rush.",
  },
  {
    topic: "process",
    question: "Is a Declaration of Value always needed?",
    answer:
      "No. You need a DOV or a CIMEA statement only if your university asks for one, and some universities accept only CIMEA. We check each university's rule before you pay for either.",
  },
  {
    topic: "scholarships",
    question: "Can Indian students get scholarships in Italy?",
    answer:
      "Yes. Regional DSU scholarships are open to international students at public universities and are based on family income and assets. For 2026/27 the national minimum for a student living away from home is €7,171.11 a year, and many regions add housing and meals.",
  },
];
