import Link from "next/link";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const inputClass =
  "block h-12 w-full rounded-xl border border-border-strong bg-card px-4 text-[1rem] text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12 disabled:cursor-not-allowed disabled:bg-paper-deep/60";

/**
 * Sign-in / sign-up form design. Until an authentication provider is configured
 * (Phase 2: Supabase Auth with Google and email), every control is disabled and
 * the page says so — nothing pretends to sign anyone in.
 */
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignIn = mode === "sign-in";
  // Flips to true only when Phase 2 wires these controls to Supabase Auth.
  const available = false;
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">{isSignIn ? "Welcome back" : "Create your student account"}</h1>
      <p className="mt-3 text-muted">
        {isSignIn ? "Sign in to follow your applications, documents and next steps." : "One place for your journey — tasks, documents, payments and updates."}
      </p>

      {!available && (
        <div className="mt-8 flex gap-3 rounded-xl border border-warning-border bg-warning-bg p-4 text-[0.9375rem] text-warning-fg" role="status">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Student accounts aren&rsquo;t open yet. If you&rsquo;re already working with an advisor, they&rsquo;ll send you an invitation when the portal launches.{" "}
            <Link href="/contact" className="font-medium underline underline-offset-4">Make an enquiry</Link> in the meantime.
          </p>
        </div>
      )}

      <fieldset disabled={!available} className="mt-8 grid gap-5" aria-label={isSignIn ? "Sign in" : "Create account"}>
        <Button variant="secondary" size="lg" className="w-full">Continue with Google</Button>
        <div className="flex items-center gap-4 text-xs tracking-wide text-muted uppercase">
          <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
        </div>
        {!isSignIn && (
          <div>
            <label htmlFor="auth-name" className="mb-2 block text-sm font-medium">Full name</label>
            <input id="auth-name" name="name" autoComplete="name" className={inputClass} />
          </div>
        )}
        <div>
          <label htmlFor="auth-email" className="mb-2 block text-sm font-medium">Email</label>
          <input id="auth-email" name="email" type="email" autoComplete="email" className={inputClass} />
        </div>
        <div>
          <label htmlFor="auth-password" className="mb-2 flex justify-between text-sm font-medium">
            Password
          </label>
          <input id="auth-password" name="password" type="password" autoComplete={isSignIn ? "current-password" : "new-password"} className={inputClass} />
        </div>
        {!isSignIn && (
          <fieldset className="grid gap-3 rounded-xl border border-border bg-paper-deep/50 p-4">
            <legend className="px-1 text-sm font-semibold text-ink">Before you create your account</legend>
            {signUpConsents.map((consent) => (
              <label key={consent.id} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <input type="checkbox" name={consent.id} required={consent.required} className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]" />
                <span>
                  {consent.label}
                  {!consent.required && <span className="text-muted"> (optional)</span>}
                </span>
              </label>
            ))}
          </fieldset>
        )}
        <Button size="lg" className="w-full">{isSignIn ? "Sign in" : "Create account"}</Button>
      </fieldset>

      <p className="mt-8 text-center text-sm text-muted">
        {isSignIn ? "New to AsterPath? " : "Already have an account? "}
        <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="font-medium text-primary hover:text-primary-deep">
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
