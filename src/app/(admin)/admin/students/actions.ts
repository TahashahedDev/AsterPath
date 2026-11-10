"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { workflowStages } from "@/features/operations/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CaseStage } from "@/lib/supabase/types";

export type CaseFormState = { status: "idle" | "error" | "saved"; message?: string };

const fail = (message: string): CaseFormState => ({ status: "error", message });
const denied = "Not saved. Your role may not allow changing cases.";

const stageSchema = z.object({ caseId: z.uuid(), stage: z.enum(workflowStages.map((s) => s.value) as [CaseStage, ...CaseStage[]]) });

/** Moves a case to another stage; the student sees it in their portal straight away. RLS 'cases.write'; audited. */
export async function updateCaseStage(_: CaseFormState, form: FormData): Promise<CaseFormState> {
  const parsed = stageSchema.safeParse({ caseId: form.get("caseId"), stage: form.get("stage") });
  if (!parsed.success) return fail("Choose a stage.");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase isn't connected.");
  const { data, error } = await supabase.from("student_cases").update({ stage: parsed.data.stage }).eq("id", parsed.data.caseId).select("id");
  if (error || !data?.length) return fail(denied);
  revalidatePath(`/admin/students/${parsed.data.caseId}`);
  return { status: "saved", message: "Stage saved." };
}

const taskSchema = z.object({
  caseId: z.uuid(),
  title: z.string().trim().min(1, { error: "Describe the task." }).max(160),
  dueOn: z.union([z.iso.date(), z.literal("")]),
});

/** Adds a task the student sees in their portal. */
export async function addCaseTask(_: CaseFormState, form: FormData): Promise<CaseFormState> {
  const parsed = taskSchema.safeParse({ caseId: form.get("caseId"), title: form.get("title"), dueOn: form.get("dueOn") ?? "" });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the task.");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase isn't connected.");
  const { error } = await supabase.from("case_tasks").insert({ case_id: parsed.data.caseId, title: parsed.data.title, due_on: parsed.data.dueOn || null });
  if (error) return fail(denied);
  revalidatePath(`/admin/students/${parsed.data.caseId}`);
  return { status: "saved", message: "Task added." };
}

const toggleSchema = z.object({ caseId: z.uuid(), taskId: z.uuid(), done: z.enum(["true", "false"]).transform((v) => v === "true") });

/** Marks a task done or reopens it. */
export async function setCaseTaskDone(form: FormData): Promise<void> {
  const parsed = toggleSchema.safeParse({ caseId: form.get("caseId"), taskId: form.get("taskId"), done: form.get("done") });
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  await supabase.from("case_tasks").update({ done: parsed.data.done }).eq("id", parsed.data.taskId);
  revalidatePath(`/admin/students/${parsed.data.caseId}`);
}
