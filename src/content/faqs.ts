export type Faq = { question: string; answer: string; topic: "general" | "pricing" | "process" | "scholarships" };

export const faqs: Faq[] = [
  {
    topic: "general",
    question: "Why only Italy?",
    answer:
      "Because doing one country properly is better than doing ten superficially. Italy's process has its own systems — Universitaly, the Declaration of Value, regional DSU scholarships, the ISEE parificato — and small mistakes cost months. We focus on it completely.",
  },
  {
    topic: "general",
    question: "Do you guarantee admission or a visa?",
    answer:
      "No. Universities decide admissions and the Italian mission decides visas. Anyone who guarantees either is not being honest with you. We guarantee our own work: complete, carefully checked applications and files, prepared on time.",
  },
  {
    topic: "general",
    question: "What does “no ghosting” actually mean?",
    answer:
      "One named advisor owns your file from the first call to your arrival. We reply within one working day, send weekly updates during active stages, and if your advisor is ever unavailable you are introduced to their replacement — you never have to chase us.",
  },
  {
    topic: "pricing",
    question: "Are university fees included?",
    answer:
      "University application fees are included up to the allowance in your package, and the Complete packages also include the enrolment administrative fees at your chosen university. Tuition, test fees, attestation, apostille, translation, visa and travel costs are not included — we list every one of them openly.",
  },
  {
    topic: "pricing",
    question: "Do I pay everything upfront?",
    answer:
      "No. You pay in instalments as each stage starts — onboarding, applications, admission and pre-enrolment, then visa. Your written agreement sets out every amount and date before you pay anything. The first consultation is free.",
  },
  {
    topic: "process",
    question: "When should I start for a September intake?",
    answer:
      "Ideally 10–12 months before. Attestation and apostille take weeks, English tests may need a retake, many universities open applications from winter, and a DOV can take up to 90 days. Starting late is the most common cause of a missed intake.",
  },
  {
    topic: "process",
    question: "My name is spelt differently on my passport and marksheets. Is that a problem?",
    answer:
      "It can be. Italian missions require an attested and apostilled “One and the same name” certificate to resolve the difference — affidavits are not accepted. We check for this in the first week so it never surprises you later.",
  },
  {
    topic: "scholarships",
    question: "Can Indian students get scholarships in Italy?",
    answer:
      "Yes. Regional DSU grants are means-tested and open to international students at public universities, and can include a cash grant, housing, meals and a tuition waiver. You need an ISEE parificato to apply, which takes months to prepare. Awards are decided by the regional agency.",
  },
  {
    topic: "general",
    question: "Do you help with work visas?",
    answer:
      "Not at the moment — we focus on students. After graduating in Italy you may be able to apply for a 12-month job-seeker permit, and we explain how that route works, but we do not provide job placement.",
  },
];
