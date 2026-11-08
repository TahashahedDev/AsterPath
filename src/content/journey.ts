/**
 * The general AsterPath journey. Actual stages and their order are configured
 * per country and case type (Phase 4 workflow templates); this is the public overview.
 */

export type JourneyOwner = "you" | "asterpath" | "together" | "institution";

export type JourneyStep = {
  number: number;
  title: string;
  description: string;
  owner: JourneyOwner;
  /** Some steps apply only to certain countries or cases. */
  conditional?: string;
};

export const journeyOwnerLabel: Record<JourneyOwner, string> = {
  you: "You",
  asterpath: "AsterPath",
  together: "You & AsterPath",
  institution: "University or authority",
};

export const journeySteps: JourneyStep[] = [
  {
    number: 1,
    title: "Initial enquiry",
    description: "Tell us what you're hoping to study and where. We reply with honest first thoughts and next steps — no pressure to sign up.",
    owner: "you",
  },
  {
    number: 2,
    title: "Student profile assessment",
    description: "We review your academic record, test scores and goals, and tell you clearly where you stand in each destination.",
    owner: "asterpath",
  },
  {
    number: 3,
    title: "Destination & university selection",
    description: "Together we build a shortlist with requirements, costs and deadlines taken from official sources — with links so you can check them yourself.",
    owner: "together",
  },
  {
    number: 4,
    title: "Document collection",
    description: "You upload documents to your private portal. We review each one and explain exactly what needs fixing, if anything.",
    owner: "together",
  },
  {
    number: 5,
    title: "University applications",
    description: "You submit complete, carefully checked applications from your own accounts. We track every deadline and follow-up.",
    owner: "together",
  },
  {
    number: 6,
    title: "Admission & enrolment support",
    description: "Universities make their decisions. When offers arrive, we help you compare them and complete acceptance and enrolment.",
    owner: "institution",
  },
  {
    number: 7,
    title: "Country-specific pre-enrolment",
    description: "Some countries add a national step — for example Universitaly in Italy or Études en France. We guide you through it.",
    owner: "together",
    conditional: "Where applicable",
  },
  {
    number: 8,
    title: "Visa documentation preparation",
    description: "We build your personalised visa checklist from current official guidance and review every document before your appointment.",
    owner: "asterpath",
  },
  {
    number: 9,
    title: "Visa application & appointment guidance",
    description: "You attend your appointment prepared. The decision is made by the consulate — we never claim otherwise.",
    owner: "institution",
  },
  {
    number: 10,
    title: "Pre-departure support",
    description: "Accommodation, insurance, what to pack and what to do in your first week.",
    owner: "asterpath",
  },
  {
    number: 11,
    title: "Post-arrival assistance",
    description: "Help with local registration, residence permits and settling into university life.",
    owner: "asterpath",
  },
];
