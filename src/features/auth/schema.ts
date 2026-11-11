import { z } from "zod";
import { emailAddress, personName } from "@/lib/validation/fields";

/** Versions recorded with every new account; bump when the documents change. */
export const TERMS_VERSION = "draft-2026-11";
export { PRIVACY_NOTICE_VERSION } from "@/features/leads/schema";

const email = emailAddress("Enter a valid email address.");
// bcrypt, which Supabase uses, only reads the first 72 bytes.
const password = z.string().min(10, { error: "Use at least 10 characters." }).max(72, { error: "Use 72 characters or fewer." });
const ticked = (message: string) => z.literal("on", { error: message });

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password." }).max(72),
});

/** Team sign-in takes a username (e.g. "TahaShahed") or an email. */
export const usernamePattern = /^[A-Za-z0-9._-]{3,32}$/;
export const staffSignInSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { error: "Enter your username or email." })
    .max(254)
    .refine((v) => v.includes("@") ? z.email().safeParse(v).success : usernamePattern.test(v), { error: "Enter your username or email." }),
  password: z.string().min(1, { error: "Enter your password." }).max(72),
});

export const signUpSchema = z.object({
  fullName: personName("Your full name"),
  email,
  password,
  terms: ticked("Please accept the terms and refund policy."),
  privacy: ticked("Please confirm you have read the privacy policy."),
  age: ticked("Please confirm your age, or your guardian's consent."),
  noGuarantee: ticked("Please confirm you understand there are no guarantees."),
  truthful: ticked("Please confirm your information will be genuine."),
  updates: z.literal("on").optional(),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { error: "The two passwords don't match.", path: ["confirm"] });

/** Only same-site paths inside the signed-in areas (or the password reset page) may be used as a post-login destination. */
export function safeNextPath(raw: unknown, fallback = "/portal"): string {
  if (typeof raw !== "string") return fallback;
  if (!/^\/(portal|admin)(\/[A-Za-z0-9/_-]*)?$/.test(raw) && raw !== "/reset-password") return fallback;
  return raw;
}

export type AuthFormState = {
  status: "idle" | "error" | "check-email";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};
