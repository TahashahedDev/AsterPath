"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import {
  PRIVACY_NOTICE_VERSION, TERMS_VERSION, forgotPasswordSchema, resetPasswordSchema, safeNextPath, signInSchema, signUpSchema, type AuthFormState,
} from "@/features/auth/schema";
import { getServerEnv } from "@/lib/env";
import { clientIp, createRateLimiter } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Supabase Auth limits attempts too; this stops a single source hammering one form.
const attempts = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

async function rateLimited(email: string): Promise<boolean> {
  const env = getServerEnv();
  const ip = clientIp(await headers(), { header: env.CLIENT_IP_HEADER, trustedProxyHops: env.TRUSTED_PROXY_HOPS });
  return !attempts(`${ip ?? "unverified"}|${email}`).allowed;
}

/** Reads the caller's own membership (allowed for any signed-in user by RLS, before the second factor). */
async function isActiveTeamMember(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string): Promise<boolean> {
  const { data } = await supabase.from("team_members").select("active").eq("user_id", userId).maybeSingle();
  return Boolean(data?.active);
}

const notConnected: AuthFormState = { status: "error", message: "Student accounts aren't open yet. Please make an enquiry instead." };
const tooMany: AuthFormState = { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };

export async function signIn(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConnected;
  if (await rateLimited(parsed.data.email)) return tooMany;

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // The same message whether the email exists or not.
    if (error.code === "email_not_confirmed") return { status: "error", message: "Please confirm your email first. We sent you a link when you signed up." };
    return { status: "error", message: "That email and password don't match an account." };
  }

  // Team members land in the admin workspace, students in their portal.
  const isStaff = await isActiveTeamMember(supabase, data.user.id);
  if (form.get("audience") === "staff" && !isStaff) {
    await supabase.auth.signOut();
    return { status: "error", message: "That account isn't part of the AsterPath team. Students sign in on the student page." };
  }
  const next = form.get("next");
  redirect(next ? safeNextPath(next, isStaff ? "/admin" : "/portal") : isStaff ? "/admin" : "/portal");
}

export async function signUp(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(["fullName", "email", "password", "terms", "privacy", "age", "noGuarantee", "truthful", "updates"].map((k) => [k, form.get(k) ?? undefined])));
  if (!parsed.success) return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConnected;
  if (await rateLimited(parsed.data.email)) return tooMany;

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteConfig.url}/auth/callback?next=/portal`,
      data: {
        full_name: parsed.data.fullName,
        terms_version: TERMS_VERSION,
        privacy_version: PRIVACY_NOTICE_VERSION,
        updates_consent: parsed.data.updates === "on",
      },
    },
  });
  if (error) {
    if (error.code === "weak_password") return { status: "error", fieldErrors: { password: ["Choose a stronger password: longer, and not a common one."] } };
    console.error("[auth] sign-up failed", error.code ?? error.status);
    return { status: "error", message: "We couldn't create your account just now. Please try again in a moment." };
  }
  // Shown whether or not the email was already registered, so accounts can't be discovered here.
  return { status: "check-email", message: `If ${parsed.data.email} can be registered, a confirmation link is on its way. Open it to finish creating your account.` };
}

/** Sends a reset link. The answer is the same whether or not the email has an account. */
export async function requestPasswordReset(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: form.get("email") });
  if (!parsed.success) return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConnected;
  if (await rateLimited(parsed.data.email)) return tooMany;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${siteConfig.url}/auth/callback?next=/reset-password` });
  if (error && error.code !== "user_not_found") console.error("[auth] reset request failed", error.code ?? error.status);
  return { status: "check-email", message: `If ${parsed.data.email} has an account, a link to choose a new password is on its way. It works once and expires soon.` };
}

/** Sets a new password for the session the reset link opened. */
export async function updatePassword(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({ password: form.get("password"), confirm: form.get("confirm") });
  if (!parsed.success) return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConnected;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { status: "error", message: "Your reset link has expired. Please request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "weak_password") return { status: "error", fieldErrors: { password: ["Choose a stronger password: longer, and not a common one."] } };
    if (error.code === "same_password") return { status: "error", fieldErrors: { password: ["Choose a password you haven't used here before."] } };
    console.error("[auth] password update failed", error.code ?? error.status);
    return { status: "error", message: "We couldn't update your password. Please try again." };
  }
  redirect("/portal");
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}

export type MfaSetup = { factorId: string; qrCode: string; secret: string } | { error: string };

/** Staff only: starts adding an authenticator app and returns its QR code. Clears any half-finished setup first. */
export async function startMfaEnrollment(): Promise<MfaSetup> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Accounts aren't connected yet." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user || !(await isActiveTeamMember(supabase, auth.user.id))) return { error: "Only team members set up two-factor sign-in here." };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const stale of (factors?.all ?? []).filter((f) => f.factor_type === "totp" && f.status === "unverified")) {
    await supabase.auth.mfa.unenroll({ factorId: stale.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `AsterPath ${new Date().toISOString().slice(0, 10)}` });
  if (error || !data) {
    console.error("[auth] MFA enrolment failed", error?.code ?? error?.status);
    return { error: "We couldn't start the setup. Please try again." };
  }
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

const mfaCode = z.object({ code: z.string().trim().regex(/^\d{6}$/, { error: "Enter the 6-digit code from your app." }), factorId: z.string().optional() });
const mfaAttempts = createRateLimiter({ limit: 8, windowMs: 10 * 60 * 1000 });

/** Checks a code from the authenticator app and upgrades the session to two-factor (aal2). */
export async function verifyMfa(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = mfaCode.safeParse({ code: form.get("code"), factorId: form.get("factorId") || undefined });
  if (!parsed.success) return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConnected;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { status: "error", message: "Your session has ended. Please sign in again." };
  if (!mfaAttempts(auth.user.id).allowed) return tooMany;

  // Use the factor being set up, or the verified one for a normal sign-in; it must belong to this user.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const all = factors?.all ?? [];
  const factor = parsed.data.factorId ? all.find((f) => f.id === parsed.data.factorId) : all.find((f) => f.factor_type === "totp" && f.status === "verified");
  if (!factor) return { status: "error", message: "No authenticator found. Please start the setup again." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: parsed.data.code });
  if (error) return { status: "error", fieldErrors: { code: ["That code didn't work. Codes change every 30 seconds — try the current one."] } };
  redirect("/admin");
}
