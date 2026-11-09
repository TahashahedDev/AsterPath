/**
 * A year in the life of an application, for a September or October intake.
 * We move the visa forward on purpose: June to September is the consulates'
 * rush, so we aim to file as soon as pre-enrolment is validated.
 */
export type TimelineStep = { when: string; what: string; ahead?: boolean };

export const applicationYear: TimelineStep[] = [
  { when: "October to December", what: "Free consultation, profile review and passport check. Attestation and apostille start." },
  { when: "November to February", what: "English test, and the CEnT-S, SAT or a university test where a programme asks for one." },
  { when: "January to April", what: "Applications. Many universities run several rounds, so we file in the earliest one that fits." },
  { when: "April to June", what: "Offers, Universitaly pre-enrolment, and a Declaration of Value or CIMEA statement." },
  { when: "May to July", what: "Visa file ready and filed early, ahead of the June to September rush.", ahead: true },
  { when: "July to September", what: "ISEE parificato and the regional scholarship (DSU) application." },
  { when: "September to October", what: "Arrival, residence permit, tax code and enrolment." },
];
