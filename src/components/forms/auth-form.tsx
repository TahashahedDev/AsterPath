"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Info, MailCheck } from "lucide-react";
import { signIn, signUp } from "@/app/(auth)/actions";
import type { AuthFormState } from "@/features/auth/schema";
import { Button, buttonStyles } from "@/components/ui/button";

/** Consents recorded at sign-up. Required ones must be ticked before an account is created. */
const signUpConsents: { id: string; label: React.ReactNode; required: boolean }[] = [
  {
    id: "terms",
    required: true,
    label: (
      <>
        I agree to the <Link href="/legal/terms" className="font-semibold text-primary underline underline-offset-2">terms of service</Link> and{" "}
        <Link href="/legal/refunds" className="font-semibold text-primary underline underline-offset-2">refund policy</Link>.
      </>
    ),
  },
  {
    id: "privacy",
    required: true,
    label: (
      <>
        I have read the <Link href="/legal/privacy" className="font-semibold text-primary underline underline-offset-2">privacy policy</Link> and consent to AsterPath processing my data to provide its services.
      </>
    ),
  },
  { id: "age", required: true, label: "I am 18 or older, or my parent or guardian consents to this account." },
  { id: "noGuarantee", required: true, label: "I understand AsterPath does not guarantee admission, scholarships or visas." },
  { id: "truthful", required: true, label: "The information and documents I provide will be true and genuine." },
  { id: "updates", required: false, label: "Send me occasional updates about intakes and deadlines." },
];

export const inputClass =
  "block h-12 w-full rounded-xl border border-border-strong bg-card px-4 text-[1rem] text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12 aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:bg-paper-deep/60";

const notices: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Please sign in again.",
  google: "Google sign-in isn't available right now. Please use your email and password.",
  "not-staff": "That account isn't part of the AsterPath team. Students sign in on the student page.",
};

const initial: AuthFormState = { status: "idle" };

/**
 * Sign-in / sign-up with Supabase Auth: email and password, or Google. Until
 * Supabase is configured every control is disabled and the page says so; nothing
 * pretends to sign anyone in.
 */
export function AuthForm({ mode, available, next, notice }: { mode: "sign-in" | "sign-up" | "staff"; available: boolean; next?: string; notice?: string }) {
  const isSignIn = mode !== "sign-up";
  const isStaff = mode === "staff";
  const [state, action, pending] = useActionState(isSignIn ? signIn : signUp, initial);
  const errors = state.fieldErrors ?? {};
  const fieldError = (name: string) =>
    errors[name]?.[0] ? (
      <p id={`auth-${name}-error`} className="mt-2 text-sm text-danger">
        {errors[name]?.[0]}
      </p>
    ) : null;
  const invalid = (name: string) => (errors[name]?.[0] ? { "aria-invalid": true, "aria-describedby": `auth-${name}-error` } : {});
  const alert = state.message ?? (notice ? notices[notice] : undefined);

  if (state.status === "check-email") {
    return (
      <div role="status">
        <MailCheck className="size-10 text-primary" strokeWidth={1.5} aria-hidden="true" />
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.025em]">Check your inbox</h1>
        <p className="mt-3 leading-relaxed text-muted">{state.message}</p>
        <Link href="/sign-in" className="mt-8 inline-flex font-medium text-primary hover:text-primary-deep">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      {isStaff && <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">AsterPath team</p>}
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">{isStaff ? "Team sign-in" : isSignIn ? "Welcome back" : "Create your student account"}</h1>
      <p className="mt-3 text-muted">
        {isStaff
          ? "For advisors, reviewers and administrators. You'll confirm with a code from your authenticator app next."
          : isSignIn
            ? "Sign in to follow your applications, documents and next steps."
            : "One place for your journey — tasks, documents, payments and updates."}
      </p>

      {!available && (
        <div className="mt-8 flex gap-3 rounded-xl border border-warning-border bg-warning-bg p-4 text-[0.9375rem] text-warning-fg" role="status">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            {isStaff ? (
              <>Team accounts need the Supabase connection, which isn&rsquo;t set up yet.</>
            ) : (
              <>
                Student accounts aren&rsquo;t open yet. If you&rsquo;re already working with an advisor, they&rsquo;ll send you an invitation when the portal launches.{" "}
                <Link href="/contact" className="font-medium underline underline-offset-4">Make an enquiry</Link> in the meantime.
              </>
            )}
          </p>
        </div>
      )}

      {alert && (
        <p className="mt-8 rounded-xl border border-warning-border bg-warning-bg p-4 text-[0.9375rem] text-warning-fg" role="alert">
          {alert}
        </p>
      )}

      <div className="mt-8 grid gap-5">
        {available ? (
          <a href={`/auth/google?next=${encodeURIComponent(next ?? (isStaff ? "/admin" : "/portal"))}`} className={buttonStyles({ variant: "secondary", size: "lg", className: "w-full" })}>
            Continue with Google
          </a>
        ) : (
          <Button variant="secondary" size="lg" className="w-full" disabled>
            Continue with Google
          </Button>
        )}
        <div className="flex items-center gap-4 text-xs tracking-wide text-muted uppercase">
          <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
        </div>

        <form action={action} noValidate>
          <fieldset disabled={!available || pending} className="grid gap-5" aria-label={isSignIn ? "Sign in with email" : "Create account with email"}>
            {next && <input type="hidden" name="next" value={next} />}
            {isStaff && <input type="hidden" name="audience" value="staff" />}
            {!isSignIn && (
              <div>
                <label htmlFor="auth-fullName" className="mb-2 block text-sm font-medium">Full name</label>
                <input id="auth-fullName" name="fullName" autoComplete="name" className={inputClass} {...invalid("fullName")} />
                {fieldError("fullName")}
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="mb-2 block text-sm font-medium">Email</label>
              <input id="auth-email" name="email" type="email" autoComplete="email" className={inputClass} {...invalid("email")} />
              {fieldError("email")}
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <label htmlFor="auth-password" className="font-medium">
                  Password
                </label>
                {isSignIn ? (
                  <Link href="/forgot-password" className="font-medium text-primary underline-offset-4 hover:underline">
                    Forgot password?
                  </Link>
                ) : (
                  <span className="text-muted">At least 10 characters</span>
                )}
              </div>
              <input id="auth-password" name="password" type="password" autoComplete={isSignIn ? "current-password" : "new-password"} className={inputClass} {...invalid("password")} />
              {fieldError("password")}
            </div>
            {!isSignIn && (
              <fieldset className="grid gap-3 rounded-xl border border-border bg-paper-deep/50 p-4">
                <legend className="px-1 text-sm font-semibold text-ink">Before you create your account</legend>
                {signUpConsents.map((consent) => (
                  <div key={consent.id}>
                    <label className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                      <input type="checkbox" name={consent.id} required={consent.required} className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]" {...invalid(consent.id)} />
                      <span>
                        {consent.label}
                        {!consent.required && <span className="text-muted"> (optional)</span>}
                      </span>
                    </label>
                    {fieldError(consent.id)}
                  </div>
                ))}
              </fieldset>
            )}
            <Button type="submit" size="lg" className="w-full">
              {pending ? "Please wait…" : isSignIn ? "Sign in" : "Create account"}
            </Button>
          </fieldset>
        </form>
      </div>

      {isStaff ? (
        <p className="mt-8 text-center text-sm text-muted">
          Team accounts are created by invitation only.{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:text-primary-deep">
            Student sign-in
          </Link>
        </p>
      ) : (
        <>
          <p className="mt-8 text-center text-sm text-muted">
            {isSignIn ? "New to AsterPath? " : "Already have an account? "}
            <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="font-medium text-primary hover:text-primary-deep">
              {isSignIn ? "Create an account" : "Sign in"}
            </Link>
          </p>
          {isSignIn && (
            <p className="mt-3 text-center text-xs text-muted">
              AsterPath team?{" "}
              <Link href="/staff/sign-in" className="font-medium text-ink-soft underline-offset-4 hover:underline">
                Team sign-in
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
