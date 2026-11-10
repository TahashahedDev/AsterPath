"use client";

/* eslint-disable @next/next/no-img-element -- the QR code is an inline SVG data URL from Supabase, not a remote image. */
import { useActionState, useState, useTransition } from "react";
import { KeyRound, LoaderCircle, ShieldCheck, Smartphone } from "lucide-react";
import { signOut, startMfaEnrollment, verifyMfa, type MfaSetup } from "@/app/(auth)/actions";
import type { AuthFormState } from "@/features/auth/schema";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/forms/auth-form";

const initial: AuthFormState = { status: "idle" };

function CodeForm({ factorId, label }: { factorId?: string; label: string }) {
  const [state, action, pending] = useActionState(verifyMfa, initial);
  const error = state.fieldErrors?.code?.[0];
  return (
    <form action={action} noValidate className="mt-6 grid gap-4">
      {factorId && <input type="hidden" name="factorId" value={factorId} />}
      <div>
        <label htmlFor="mfa-code" className="mb-2 block text-sm font-medium">
          {label}
        </label>
        <input
          id="mfa-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          placeholder="123456"
          className={`${inputClass} text-center font-mono text-xl tracking-[0.5em]`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "mfa-code-error" : undefined}
        />
        {error && (
          <p id="mfa-code-error" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
      {state.message && (
        <p className="rounded-xl border border-warning-border bg-warning-bg p-3 text-sm text-warning-fg" role="alert">
          {state.message}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Checking…" : "Verify and continue"}
      </Button>
    </form>
  );
}

/** Two-factor sign-in for the team: set up an authenticator app once, then enter its code at each sign-in. */
export function MfaForm({ mode }: { mode: "enroll" | "challenge" }) {
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [starting, startTransition] = useTransition();

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">AsterPath team</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">{mode === "challenge" ? "Enter your code" : "Secure your account"}</h1>
      <p className="mt-3 leading-relaxed text-muted">
        {mode === "challenge"
          ? "Open your authenticator app and enter the 6-digit code for AsterPath."
          : "Student records are private, so every team account uses two-factor sign-in. It takes a minute, once."}
      </p>

      {mode === "challenge" && <CodeForm label="6-digit code" />}

      {mode === "enroll" && !setup && (
        <div className="mt-8 grid gap-4">
          <ol className="grid gap-3 text-sm text-ink-soft">
            <li className="flex gap-3"><Smartphone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> Install an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password or similar).</li>
            <li className="flex gap-3"><KeyRound className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> Scan the QR code we show you, then type the code the app gives you.</li>
          </ol>
          <Button size="lg" className="w-full" disabled={starting} onClick={() => startTransition(async () => setSetup(await startMfaEnrollment()))}>
            {starting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />} Set up authenticator
          </Button>
        </div>
      )}

      {mode === "enroll" && setup && "error" in setup && (
        <p className="mt-8 rounded-xl border border-warning-border bg-warning-bg p-4 text-sm text-warning-fg" role="alert">
          {setup.error}
        </p>
      )}

      {mode === "enroll" && setup && "factorId" in setup && (
        <div className="mt-8">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6">
            <img src={setup.qrCode} alt="QR code to add AsterPath to your authenticator app" width={184} height={184} className="rounded-lg bg-white p-2" />
            <div className="text-center text-xs text-muted">
              Can&rsquo;t scan? Enter this key in the app:
              <code className="mt-1 block font-mono text-sm break-all text-ink select-all">{setup.secret}</code>
            </div>
          </div>
          <CodeForm factorId={setup.factorId} label="Code from your app" />
        </div>
      )}

      <form action={signOut} className="mt-8 text-center">
        <button type="submit" className="text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
          Sign out
        </button>
      </form>
    </div>
  );
}
