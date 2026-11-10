"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PaymentFormState = { status: "idle" | "error" | "saved"; message?: string };

const confirmSchema = z.object({
  instalmentId: z.uuid(),
  reference: z.string().trim().min(4, { error: "Enter the bank UTR or Razorpay payment ID." }).max(80),
  paidOn: z.iso.date({ error: "Enter the date the money arrived." }),
});

/**
 * Records an instalment as paid. Finance checks the money against the bank or
 * Razorpay record first — never a screenshot — and types its reference here.
 * RLS 'payments.write'; audited with old and new values. Confirming the first
 * instalment activates the student's case.
 */
export async function confirmInstalment(_: PaymentFormState, form: FormData): Promise<PaymentFormState> {
  const parsed = confirmSchema.safeParse({ instalmentId: form.get("instalmentId"), reference: form.get("reference"), paidOn: form.get("paidOn") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Supabase isn't connected." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Sign in again." };
  const { data, error } = await supabase
    .from("instalments")
    .update({ status: "paid", paid_at: `${parsed.data.paidOn}T12:00:00+05:30`, payment_reference: parsed.data.reference, confirmed_by: user.id })
    .eq("id", parsed.data.instalmentId)
    .neq("status", "paid")
    .select("id");
  if (error || !data?.length) return { status: "error", message: "Not saved. Only finance, admins and owners confirm payments." };
  revalidatePath("/admin/payments");
  revalidatePath("/admin/students");
  return { status: "saved", message: "Payment confirmed." };
}

const statusSchema = z.object({ instalmentId: z.uuid(), status: z.enum(["upcoming", "due", "waived"]), dueOn: z.union([z.iso.date(), z.literal("")]) });

/** Requests an instalment (due, with a date), puts it back to upcoming, or waives it — e.g. Arrival after a visa refusal. */
export async function setInstalmentStatus(form: FormData): Promise<void> {
  const parsed = statusSchema.safeParse({ instalmentId: form.get("instalmentId"), status: form.get("status"), dueOn: form.get("dueOn") ?? "" });
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  await supabase
    .from("instalments")
    .update({ status: parsed.data.status, due_on: parsed.data.dueOn || null })
    .eq("id", parsed.data.instalmentId)
    .neq("status", "paid");
  revalidatePath("/admin/payments");
}
