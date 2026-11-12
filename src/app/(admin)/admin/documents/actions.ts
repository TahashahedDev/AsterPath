"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { multiLine, optionalDateWithin, singleLine } from "@/lib/validation/fields";
import { documentLink, type LinkResult } from "@/server/services/documents";

export type DocumentFormState = { status: "idle" | "error" | "saved"; message?: string };
const fail = (message: string): DocumentFormState => ({ status: "error", message });

const requestSchema = z.object({
  caseId: z.uuid(),
  typeKey: z.string().regex(/^[a-z0-9_]{2,40}$/, { error: "Choose a document type." }),
  title: singleLine({ label: "Document name", min: 2, max: 120 }),
  instructions: multiLine({ label: "Instructions", max: 1000, maxLinks: 2 }),
  dueOn: optionalDateWithin({ past: 0, future: 730, message: "Choose a due date within the next two years." }),
  expiresOn: optionalDateWithin({ past: 0, future: 3650, message: "Choose an expiry date in the future." }),
});

/** Asks a student for a document. RLS: 'documents.request'; audited. */
export async function requestDocument(_: DocumentFormState, form: FormData): Promise<DocumentFormState> {
  const parsed = requestSchema.safeParse({
    caseId: form.get("caseId"),
    typeKey: form.get("typeKey"),
    title: form.get("title"),
    instructions: form.get("instructions") ?? "",
    dueOn: form.get("dueOn") ?? "",
    expiresOn: form.get("expiresOn") ?? "",
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the details.");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase isn't connected.");
  const { caseId, typeKey, title, instructions, dueOn, expiresOn } = parsed.data;
  const { error } = await supabase.from("document_requests").insert({ case_id: caseId, type_key: typeKey, title, instructions, due_on: dueOn || null, expires_on: expiresOn || null });
  if (error) return fail("Not saved. Your role may not allow requesting documents.");
  revalidatePath(`/admin/students/${caseId}`);
  revalidatePath("/admin/documents");
  return { status: "saved", message: "Requested. The student sees it in their portal now." };
}

const reviewSchema = z
  .object({
    requestId: z.uuid(),
    // The version the reviewer opened; the database refuses a decision if the file has changed since.
    versionId: z.union([z.uuid(), z.literal("")]),
    decision: z.enum(["approved", "rejected", "reupload_required", "withdrawn"]),
    note: multiLine({ label: "Feedback", max: 1000, maxLinks: 2 }),
  })
  .refine((v) => (v.decision !== "rejected" && v.decision !== "reupload_required") || v.note.length >= 3, { error: "Tell the student what's wrong so they can fix it." });

/** Approve, reject, ask for a replacement or withdraw. The database checks the transition and the reviewer's rights. */
export async function reviewDocument(_: DocumentFormState, form: FormData): Promise<DocumentFormState> {
  const parsed = reviewSchema.safeParse({ requestId: form.get("requestId"), versionId: form.get("versionId") ?? "", decision: form.get("decision"), note: form.get("note") ?? "" });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the decision.");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase isn't connected.");
  const { requestId, versionId, decision, note } = parsed.data;
  const { error } = await supabase.rpc("document_review_action", { p_request: requestId, p_action: decision, p_note: note, ...(versionId ? { p_version: versionId } : {}) });
  if (error) return fail(error.code === "42501" ? "Your role can't review this document." : "That decision isn't possible now: the file or its status has changed. Refresh and try again.");
  revalidatePath(`/admin/documents/${parsed.data.requestId}`);
  revalidatePath("/admin/documents");
  return { status: "saved", message: "Saved. The student sees the outcome in their portal." };
}

/** A five-minute preview link; opening a new upload starts its review. */
export async function openDocumentVersion(versionId: string, requestId: string): Promise<LinkResult> {
  const parsed = z.object({ versionId: z.uuid(), requestId: z.uuid() }).safeParse({ versionId, requestId });
  if (!parsed.success) return { ok: false, message: "That file couldn't be found." };
  const result = await documentLink(parsed.data.versionId, "preview");
  revalidatePath(`/admin/documents/${parsed.data.requestId}`);
  return result;
}
