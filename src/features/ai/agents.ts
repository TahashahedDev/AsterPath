/**
 * The AsterPath agent registry: what each AI agent is for, what it may read and
 * what it must never do. Only agents marked `enabled` can be run; the rest are
 * defined so the roadmap, permissions and UI exist before the code does.
 * Pure data — safe to import on client and server.
 */
export type AgentId =
  | "student_support" | "university_research" | "marketing_assistant" | "document_checklist" | "intake_assessment"
  | "seo_content" | "case_management" | "business_intelligence" | "knowledge_verification" | "operations_assistant";

export type AgentDefinition = {
  id: AgentId;
  name: string;
  purpose: string;
  /** What the agent may read. "approved_knowledge" = the sourced public content only. */
  reads: ("approved_knowledge" | "marketing_brief" | "aggregate_metrics" | "case_records")[];
  output: "answer_with_sources" | "draft_for_review";
  enabled: boolean;
  placeholder?: string;
};

export const agentRegistry: AgentDefinition[] = [
  { id: "student_support", name: "Student Support", purpose: "Answers general questions about studying in Italy from approved, sourced knowledge only.", reads: ["approved_knowledge"], output: "answer_with_sources", enabled: true, placeholder: "How much money do I need to show for an Italian study visa?" },
  { id: "university_research", name: "University Research", purpose: "Summarises source-backed facts on universities, tests, DOV and scholarships for an advisor.", reads: ["approved_knowledge"], output: "answer_with_sources", enabled: true, placeholder: "Summarise the DOV and CIMEA routes for a 4-year B.Tech graduate." },
  { id: "marketing_assistant", name: "Marketing Assistant", purpose: "Drafts Instagram, Facebook and landing-page copy for human approval.", reads: ["marketing_brief", "approved_knowledge"], output: "draft_for_review", enabled: true, placeholder: "Three Instagram reel hooks about starting the DSU scholarship paperwork early." },
  { id: "document_checklist", name: "Document Checklist", purpose: "Builds a per-student checklist from programme and country rules.", reads: ["approved_knowledge", "case_records"], output: "draft_for_review", enabled: false },
  { id: "intake_assessment", name: "Intake Assessment", purpose: "Pre-reads an enquiry and suggests questions for the first call.", reads: ["case_records"], output: "draft_for_review", enabled: false },
  { id: "seo_content", name: "SEO Content", purpose: "Outlines source-backed guide articles for the website.", reads: ["approved_knowledge"], output: "draft_for_review", enabled: false },
  { id: "case_management", name: "Case Management", purpose: "Flags overdue tasks, expiring documents and stalled cases.", reads: ["case_records"], output: "draft_for_review", enabled: false },
  { id: "business_intelligence", name: "Business Intelligence", purpose: "Explains pipeline and revenue trends from aggregate metrics.", reads: ["aggregate_metrics"], output: "draft_for_review", enabled: false },
  { id: "knowledge_verification", name: "Knowledge Verification", purpose: "Compares published guidance with official sources and flags stale facts.", reads: ["approved_knowledge"], output: "draft_for_review", enabled: false },
  { id: "operations_assistant", name: "Operations Assistant", purpose: "Drafts internal summaries and handovers for the team.", reads: ["case_records"], output: "draft_for_review", enabled: false },
];

/** Hard limits for every agent, enforced in the system prompt and by the platform (no tools exist for these actions). */
export const agentGuardrails = [
  "Never submit applications or visa forms",
  "Never make legal determinations or guarantee admission or visas",
  "Never move money, approve refunds or delete records",
  "Never send external messages — every output is a draft for a person",
  "Never state deadlines, fees or requirements that are not in approved sources",
  "No testimonials, invented students or success-rate claims",
] as const;

export const enabledAgentIds = agentRegistry.filter((a) => a.enabled).map((a) => a.id) as ["student_support", "university_research", "marketing_assistant"];
