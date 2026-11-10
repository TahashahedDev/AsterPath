"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Info, MailCheck } from "lucide-react";
import { requestPasswordReset, updatePassword } from "@/app/(auth)/actions";
import type { AuthFormState } from "@/features/auth/schema";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/forms/auth-form";

const initial: AuthFormState = { status: "idle" };

function useFieldHelpers(state: AuthFormState) {
  const errors = state.fieldErrors ?? {};
  const fieldError = (name: string) =>
    errors[name]?.[0] ? (
      <p id={`pw-${name}-error`} className="mt-2 text-sm text-danger">
        {errors[name]?.[0]}
      </p>
    ) : null;
  const invalid = (name: string) => (errors[name]?.[0] ? { "aria-invalid": true, "aria-describedby": `pw-${name}-error` } : {});
  return { fieldError, invalid };
}

function NotOpen() {
  return (
    <div className="mt-8 flex gap-3 rounded-xl border border-warning-border bg-warning-bg p-4 text-[0.9375rem] text-warning-fg" role="status">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>Student accounts aren&rsquo;t open yet, so there is no password to reset.</p>
    </div>
  );
}

/** Step 1: ask for the email and send a one-time reset link. */
export function ForgotPasswordForm({ available }: { available: boolean }) {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  const { fieldError, invalid } = useFieldHelpers(state);

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
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Reset your password</h1>
      <p className="mt-3 text-muted">Enter the email you signed up with and we&rsquo;ll send you a link to choose a new password.</p>
      {!available && <NotOpen />}
      {state.message && (
        <p className="mt-8 rounded-xl border border-warning-border bg-warning-bg p-4 text-[0.9375rem] text-warning-fg" role="alert">
          {state.message}
        </p>
      )}
      <form action={action} noValidate className="mt-8">
        <fieldset disabled={!available || pending} className="grid gap-5">
          <div>
            <label htmlFor="pw-email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input id="pw-email" name="email" type="email" autoComplete="email" className={inputClass} {...invalid("email")} />
            {fieldError("email")}
          </div>
          <Button type="submit" size="lg" className="w-full">
            {pending ? "Please wait…" : "Send reset link"}
          </Button>
        </fieldset>
      </form>
      <p className="mt-6 text-sm text-muted">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

/** Step 2: opened from the emailed link (which signs the person in), choose the new password. */
export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  const { fieldError, invalid } = useFieldHelpers(state);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Choose a new password</h1>
      <p className="mt-3 text-muted">Use at least 10 characters. A short phrase is easier to remember than a jumble.</p>
      {state.message && (
        <p className="mt-8 rounded-xl border border-warning-border bg-warning-bg p-4 text-[0.9375rem] text-warning-fg" role="alert">
          {state.message}{" "}
          {state.message.includes("expired") && (
            <Link href="/forgot-password" className="font-medium underline underline-offset-4">
              Request a new link
            </Link>
          )}
        </p>
      )}
      <form action={action} noValidate className="mt-8">
        <fieldset disabled={pending} className="grid gap-5">
          <div>
            <label htmlFor="pw-password" className="mb-2 block text-sm font-medium">
              New password
            </label>
            <input id="pw-password" name="password" type="password" autoComplete="new-password" className={inputClass} {...invalid("password")} />
            {fieldError("password")}
          </div>
          <div>
            <label htmlFor="pw-confirm" className="mb-2 block text-sm font-medium">
              Repeat new password
            </label>
            <input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" className={inputClass} {...invalid("confirm")} />
            {fieldError("confirm")}
          </div>
          <Button type="submit" size="lg" className="w-full">
            {pending ? "Saving…" : "Save new password"}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}
