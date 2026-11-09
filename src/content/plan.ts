/**
 * The AsterPath plan: one plan per student, everything in it, paid in
 * instalments as each stage starts. Prices are quoted individually after the
 * free consultation and never published.
 *
 * Consulate rules shape what we can pay directly. The enrolment fee must show on
 * the student's own bank statement, and the visa appointment is booked and paid
 * by the student; for those the plan credits the amount back instead.
 */

export const plan = {
  name: "The AsterPath plan",
  intakeNote: "We take a limited number of students each intake.",
  services: [
    "Profile review and an honest first plan",
    "University shortlist with requirements and deadlines",
    "English test planning and entrance test guidance",
    "Every application, statement of purpose and CV, reviewed with you",
    "Universitaly pre-enrolment, Declaration of Value or CIMEA",
    "Regional scholarship (DSU) application and ISEE parificato",
    "Your study visa file, checked line by line before your appointment",
    "Accommodation search guidance",
    "Arrival guidance: residence permit, tax code, health registration",
  ],
  weCover: [
    "English test fee (IELTS or equivalent)",
    "University application fees",
    "Notary, state HRD attestation and MEA apostille",
    "Certified translations",
    "CIMEA statement, or a paid Declaration of Value where needed",
    "ISEE parificato translations and legalisation",
    "Medical insurance for your visa",
    "Courier charges",
  ],
  weCredit: [
    { item: "University enrolment fee", why: "It must appear on your own bank statement for the visa." },
    { item: "Visa fee and VFS service charge", why: "You book and pay at your appointment with your own account." },
    { item: "Residence permit fee in Italy", why: "You pay it in person at the post office after arrival." },
  ],
  notIncluded: [
    { item: "Tuition and university contributions", why: "Paid to your university; often reduced through the ISEE." },
    { item: "Proof of funds", why: "The visa needs your own or a family sponsor's money in your account." },
    { item: "Flights", why: "Booked by your family; we tell you when to reserve." },
    { item: "Rent, deposits and living costs", why: "We guide the search, and the contract is yours." },
  ],
  instalments: [
    { stage: "Onboarding", when: "When you join", covers: "Your document plan and profile work" },
    { stage: "Applications", when: "When applications open", covers: "English test, shortlist and every application" },
    { stage: "Admission", when: "When an offer arrives", covers: "Universitaly, DOV or CIMEA, scholarships" },
    { stage: "Visa", when: "When your visa file starts", covers: "Visa file, insurance and appointment preparation" },
    { stage: "Arrival", when: "Before you fly", covers: "Pre-departure and arrival guidance" },
  ],
};
