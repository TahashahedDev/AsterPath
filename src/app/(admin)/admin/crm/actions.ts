"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { dateWithin, multiLine, singleLine } from "@/lib/validation/fields";
import type { LeadStage } from "@/features/operations/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json, LeadStatus } from "@/lib/supabase/types";
import { buildQuote, type QuoteInput } from "@/features/pricing/quote";
import { formatInr } from "@/lib/utils";

const statusFromStage: Record<LeadStage, LeadStatus> = {
  new: "new",
  contacted: "contacted",
  consultation: "consultation_booked",
  profile_evaluation: "qualified",
  proposal: "proposal",
  agreement: "agreement",
  payment: "payment",
  converted: "converted",
  lost: "closed",
};

const stageSchema = z
  .object({
    id: z.uuid(),
    stage: z.enum(Object.keys(statusFromStage) as [LeadStage, ...LeadStage[]]),
    lostReason: singleLine({ label: "Reason", min: 0, max: 120 }).optional(),
  })
  .refine((v) => v.stage !== "lost" || !!v.lostReason, { error: "Give a reason when marking a lead lost." });

export type StageResult = { ok: true } | { ok: false; message: string };

/**
 * Moves a lead along the pipeline. Runs as the signed-in staff member, so Row
 * Level Security ('leads.write') decides and the audit trigger records it.
 */
export async function updateLeadStage(input: { id: string; stage: LeadStage; lostReason?: string }): Promise<StageResult> {
  const parsed = stageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid change." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase isn't connected." };

  const { data, error } = await supabase
    .from("leads")
    .update({ status: statusFromStage[parsed.data.stage], lost_reason: parsed.data.stage === "lost" ? parsed.data.lostReason! : null })
    .eq("id", parsed.data.id)
    .select("id");
  if (error || !data?.length) {
    if (error) console.error("[crm] stage update failed", error.code);
    return { ok: false, message: "Not saved. Your role may not allow changing leads." };
  }
  revalidatePath("/admin/crm");
  revalidatePath("/admin/leads");
  return { ok: true };
}

const assignSchema = z.object({
  id: z.uuid(),
  advisorId: z.union([z.uuid(), z.literal("")]),
  followUp: dateWithin({ past: 7, future: 365, message: "Choose a follow-up date within the next year." }),
});

export type AssignState = { status: "idle" | "error" | "saved"; message?: string };

/** Sets a lead's advisor and next follow-up date (09:00 India time). RLS 'leads.write' decides; audited. */
export async function assignLead(_: AssignState, form: FormData): Promise<AssignState> {
  const parsed = assignSchema.safeParse({ id: form.get("id"), advisorId: form.get("advisorId"), followUp: form.get("followUp") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the advisor and date." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Supabase isn't connected." };

  const { data, error } = await supabase
    .from("leads")
    .update({ assigned_to: parsed.data.advisorId || null, follow_up_due_at: `${parsed.data.followUp}T09:00:00+05:30` })
    .eq("id", parsed.data.id)
    .select("id");
  if (error || !data?.length) {
    if (error) console.error("[crm] assign failed", error.code);
    return { status: "error", message: "Not saved. Your role may not allow changing leads." };
  }
  revalidatePath(`/admin/leads/${parsed.data.id}`);
  revalidatePath("/admin/crm");
  revalidatePath("/admin/leads");
  return { status: "saved", message: "Saved." };
}

export type FormState = { status: "idle" | "error" | "saved"; message?: string };

const noteSchema = z.object({ leadId: z.uuid(), body: multiLine({ label: "Note", min: 1, max: 2000, maxLinks: 5 }) });

/** Adds a note to a lead as the signed-in staff member. */
export async function addLeadNote(_: FormState, form: FormData): Promise<FormState> {
  const parsed = noteSchema.safeParse({ leadId: form.get("leadId"), body: form.get("body") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Supabase isn't connected." };
  const { error } = await supabase.from("lead_notes").insert({ lead_id: parsed.data.leadId, body: parsed.data.body });
  if (error) {
    console.error("[crm] note failed", error.code);
    return { status: "error", message: "Not saved. Your role may not allow changing leads." };
  }
  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
  return { status: "saved", message: "Note added." };
}

const quoteInputSchema = z.object({
  level: z.enum(["bachelors", "masters", "phd"]),
  applications: z.number().int().min(1).max(10),
  needsEnglishTest: z.boolean(),
  needsTranslations: z.boolean(),
  recognition: z.enum(["cimea", "free-dov"]),
  dsu: z.boolean(),
  referral: z.boolean(),
  earlyStart: z.boolean(),
  extraDiscountPercent: z.number().min(0).max(100),
});

/** Saves a quote against a lead. The figure is recomputed here from the rate card; the browser's numbers are never trusted. */
export async function saveQuote(leadId: string, input: QuoteInput): Promise<FormState> {
  const id = z.uuid().safeParse(leadId);
  const parsed = quoteInputSchema.safeParse(input);
  if (!id.success || !parsed.success) return { status: "error", message: "Check the quote inputs." };
  const quote = buildQuote(parsed.data);
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Supabase isn't connected." };
  const { error } = await supabase.from("quotes").insert({ lead_id: id.data, level: parsed.data.level, inputs: parsed.data, breakdown: quote as unknown as Json, total: quote.total });
  if (error) {
    console.error("[crm] quote failed", error.code);
    return { status: "error", message: "Not saved. Your role may not allow changing leads." };
  }
  revalidatePath(`/admin/leads/${id.data}`);
  return { status: "saved", message: `Saved ${formatInr(quote.total)} to the lead.` };
}

const openSchema = z.object({ leadId: z.uuid(), quoteId: z.uuid() });

/**
 * Opens the student case once the agreement is signed: creates the instalment
 * schedule from the chosen quote (first instalment due) and converts the lead.
 * The case goes live when finance confirms that first instalment.
 */
export async function openCase(_: FormState, form: FormData): Promise<FormState> {
  const parsed = openSchema.safeParse({ leadId: form.get("leadId"), quoteId: form.get("quoteId") });
  if (!parsed.success) return { status: "error", message: "Choose a saved quote." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Supabase isn't connected." };
  const { data: caseId, error } = await supabase.rpc("open_case", { p_lead: parsed.data.leadId, p_quote: parsed.data.quoteId });
  if (error || !caseId) {
    if (error?.code === "23505") return { status: "error", message: "A case is already open for this lead." };
    if (error?.code === "42501") return { status: "error", message: "Your role can't open cases." };
    console.error("[crm] open case failed", error?.code);
    return { status: "error", message: "The case couldn't be opened. Please try again." };
  }
  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
  revalidatePath("/admin/students");
  redirect(`/admin/students/${caseId}`);
}
