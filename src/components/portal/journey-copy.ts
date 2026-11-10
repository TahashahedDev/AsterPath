import type { WorkflowStage } from "@/features/operations/types";

type StageCopy = { title: string; you: string; us: string; decides: string };

/** Plain-language description of each stage, written for Italy. */
export const stageCopy: Record<WorkflowStage, StageCopy> = {
  profile: {
    title: "Profile assessment",
    you: "Share your marks, test scores, budget and goals.",
    us: "Assess eligibility, gaps and realistic options.",
    decides: "You and your advisor agree the direction.",
  },
  shortlist: {
    title: "University shortlist",
    you: "Review the shortlist and ask about anything unclear.",
    us: "Match programmes to your profile, deadlines and fees.",
    decides: "You choose where to apply.",
  },
  applications: {
    title: "Applications",
    you: "Upload documents and approve each final application.",
    us: "Prepare and check every file, SOP and portal form.",
    decides: "Submitted by you or with you, before each deadline.",
  },
  admission: {
    title: "Admission",
    you: "Watch your inbox and accept the offer you want.",
    us: "Read each offer and its conditions with you.",
    decides: "The university decides admission.",
  },
  pre_enrolment: {
    title: "Universitaly pre-enrolment",
    you: "Complete the Universitaly form with your chosen programme.",
    us: "Check every field and the supporting documents.",
    decides: "The university validates; the embassy receives it.",
  },
  visa: {
    title: "Visa preparation",
    you: "Gather finances, insurance and accommodation proof; attend the appointment.",
    us: "Build the visa file and run a mock checklist with you.",
    decides: "The Italian consulate decides the visa.",
  },
  departure: {
    title: "Departure",
    you: "Book travel and pack the original documents.",
    us: "Share a pre-departure checklist and arrival plan.",
    decides: "You set your travel dates.",
  },
  arrival: {
    title: "Arrival",
    you: "Apply for the permesso di soggiorno within 8 days and register locally.",
    us: "Walk you through the post office kit and codice fiscale.",
    decides: "The Questura issues the residence permit.",
  },
  enrolment: {
    title: "Enrolment on arrival",
    you: "Finalise enrolment with your original documents.",
    us: "Confirm the university's checklist with you.",
    decides: "The university completes enrolment.",
  },
};
