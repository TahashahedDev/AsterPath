"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import {
  applicationStatusOptions,
  budgetOptions,
  consultationOptions,
  destinationOptions,
  enquiryStepSchemas,
  levelOptions,
  pathwayOptions,
  type EnquiryInput,
} from "@/features/leads/schema";
import { readAttribution } from "@/features/leads/attribution";
import type { IntakeOption } from "@/features/leads/intakes";
import { CheckboxField, ChoiceGroup, SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { Button, ExternalButtonLink } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type FormValues = Omit<EnquiryInput, "attribution" | "website" | "startedAt" | "privacyAcknowledged" | "contactConsent" | "updatesConsent"> & {
  privacyAcknowledged: boolean;
  contactConsent: boolean;
  updatesConsent: boolean;
};
type FieldName = keyof FormValues;
type Errors = Partial<Record<FieldName, string>>;

const STEPS = [
  { title: "About you", fields: ["fullName", "email", "whatsapp", "countryOfResidence"] },
  { title: "Your goals", fields: ["destination", "pathway", "level", "intake"] },
  { title: "Your background", fields: ["academicBackground", "budgetRange", "applicationStatus"] },
  { title: "How we'll talk", fields: ["consultationMethod", "message", "privacyAcknowledged", "contactConsent", "updatesConsent"] },
] as const satisfies readonly { title: string; fields: readonly FieldName[] }[];

const initialValues: FormValues = {
  fullName: "",
  email: "",
  whatsapp: "",
  countryOfResidence: "India",
  destination: "" as FormValues["destination"],
  pathway: "study",
  level: "" as FormValues["level"],
  intake: "",
  academicBackground: "",
  budgetRange: "" as FormValues["budgetRange"],
  applicationStatus: "" as FormValues["applicationStatus"],
  consultationMethod: "whatsapp",
  message: "",
  privacyAcknowledged: false,
  contactConsent: false,
  updatesConsent: false,
};

type Status =
  | { kind: "editing" }
  | { kind: "submitting" }
  | { kind: "success"; reference: string }
  | { kind: "failed"; message: string; offline: boolean };

function issuesToErrors(issues: { path: PropertyKey[]; message: string }[]): Errors {
  const errors: Errors = {};
  for (const issue of issues) {
    const field = issue.path[0] as FieldName | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

/** Reads safe prefill values from links such as /contact?destination=italy or ?package=complete-journey. */
function prefillFrom(params: URLSearchParams | null): FormValues {
  const destination = params?.get("destination");
  const pkg = params?.get("package");
  return {
    ...initialValues,
    destination: destinationOptions.some((o) => o.value === destination) ? (destination as FormValues["destination"]) : initialValues.destination,
    message: pkg && /^[a-z-]{3,40}$/.test(pkg) ? `I'm interested in the ${pkg.replace(/-/g, " ")} package.` : initialValues.message,
  };
}

/** Prefilled from the URL. Must sit inside <Suspense> so the page can still be statically rendered. */
export function PrefilledEnquiryForm({ intakes }: { intakes: IntakeOption[] }) {
  const params = useSearchParams();
  return <EnquiryForm intakes={intakes} initial={prefillFrom(params)} />;
}

export function EnquiryForm({ intakes, initial = initialValues }: { intakes: IntakeOption[]; initial?: FormValues }) {
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: "editing" });
  const startedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepChanged = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Move focus to the new step heading so screen-reader and keyboard users keep their place.
  useEffect(() => {
    if (stepChanged.current) headingRef.current?.focus();
    stepChanged.current = true;
  }, [step]);

  const set = <K extends FieldName>(field: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const focusFirstError = (errs: Errors) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    });
  };

  const validateStep = (index: number): boolean => {
    const schema = enquiryStepSchemas[index];
    if (!schema) return true;
    const result = schema.safeParse(values);
    if (result.success) return true;
    const errs = issuesToErrors(result.error.issues);
    setErrors(errs);
    focusFirstError(errs);
    return false;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) return next();
    if (!validateStep(step)) return;

    setStatus({ kind: "submitting" });
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          attribution: readAttribution(),
          website: honeypot.current?.value ?? "",
          startedAt: startedAt.current,
        }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (response.status === 201 && data && typeof data === "object" && "reference" in data && typeof data.reference === "string") {
        setStatus({ kind: "success", reference: data.reference });
        return;
      }

      const err = (data as { error?: { code?: string; message?: string; fieldErrors?: Record<string, string[]> } } | null)?.error;
      if (err?.code === "validation" && err.fieldErrors) {
        const errs: Errors = {};
        for (const [field, messages] of Object.entries(err.fieldErrors)) if (messages[0]) errs[field as FieldName] = messages[0];
        setErrors(errs);
        const stepWithError = STEPS.findIndex((s) => s.fields.some((f) => errs[f]));
        if (stepWithError >= 0) setStep(stepWithError);
        setStatus({ kind: "editing" });
        focusFirstError(errs);
        return;
      }
      setStatus({ kind: "failed", message: err?.message ?? "Something went wrong. Please try again.", offline: err?.code === "not-connected" });
    } catch {
      setStatus({ kind: "failed", message: "We couldn't reach our server. Check your connection and try again, or message us on WhatsApp.", offline: false });
    }
  };

  const whatsappSummary = (reference?: string) =>
    [
      `Hello AsterPath, I'm ${values.fullName || "interested in studying in Europe"}.`,
      reference ? `My enquiry reference is ${reference}.` : null,
      values.destination && values.destination !== "undecided" ? `I'm interested in ${destinationOptions.find((o) => o.value === values.destination)?.label}.` : null,
      "I'd like to discuss my options.",
    ]
      .filter(Boolean)
      .join(" ");

  if (status.kind === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-7 sm:p-10" role="status">
        <CheckCircle2 className="size-10 text-primary" strokeWidth={1.5} aria-hidden="true" />
        <h2 className="mt-6 text-3xl font-semibold tracking-[-0.025em]">Thank you, {values.fullName.split(" ")[0]}.</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          We&rsquo;ve received your enquiry. An advisor will review it and contact you by your preferred method to arrange a first conversation.
        </p>
        <dl className="mt-8 rounded-xl bg-paper-deep/70 px-5 py-4">
          <dt className="text-sm text-muted">Your reference</dt>
          <dd className="mt-1 font-mono text-lg font-medium tracking-wide">{status.reference}</dd>
        </dl>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ExternalButtonLink href={whatsappUrl(whatsappSummary(status.reference))}>
            <MessageCircle aria-hidden="true" /> Continue on WhatsApp
          </ExternalButtonLink>
          <Link href="/how-it-works" className="inline-flex h-11 items-center justify-center px-2 text-[0.9375rem] font-medium text-primary hover:text-primary-deep">
            See what happens next
          </Link>
        </div>
        <p className="mt-8 text-sm text-muted">Please don&rsquo;t send passports or financial documents over WhatsApp or email. When you need to share documents, we&rsquo;ll give you a secure way to do it.</p>
      </div>
    );
  }

  const current = STEPS[step]!;
  const submitting = status.kind === "submitting";

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-9">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">Step {step + 1} of {STEPS.length}</span>
        <span className="text-muted">{current.title}</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span key={s.title} className={cn("h-1 rounded-full transition-colors duration-500", i <= step ? "bg-primary" : "bg-border")} />
        ))}
      </div>

      <h2 ref={headingRef} tabIndex={-1} className="mt-8 text-2xl font-semibold tracking-tight focus:outline-none">
        {current.title}
      </h2>

      {/* Honeypot: hidden from people and assistive technology, tempting to bots. */}
      <div className="sr-only" aria-hidden="true">
        <label>
          Website
          <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="mt-6 grid gap-5" key={step}>
        {step === 0 && (
          <>
            <TextField label="Full name" name="fullName" autoComplete="name" value={values.fullName} onChange={(e) => set("fullName", e.target.value)} error={errors.fullName} />
            <TextField label="Email" name="email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
            <TextField
              label="WhatsApp number"
              name="whatsapp"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
              hint="Include your country code."
              value={values.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              error={errors.whatsapp}
            />
            <TextField label="Country of residence" name="countryOfResidence" autoComplete="country-name" value={values.countryOfResidence} onChange={(e) => set("countryOfResidence", e.target.value)} error={errors.countryOfResidence} />
          </>
        )}

        {step === 1 && (
          <>
            <ChoiceGroup legend="Where would you like to go?" name="destination" value={values.destination} options={destinationOptions} onChange={(v) => set("destination", v as FormValues["destination"])} error={errors.destination} />
            <ChoiceGroup legend="What are you looking for?" name="pathway" value={values.pathway} options={pathwayOptions} onChange={(v) => set("pathway", v as FormValues["pathway"])} error={errors.pathway} columns={3} />
            <ChoiceGroup legend="Study level" name="level" value={values.level} options={levelOptions} onChange={(v) => set("level", v as FormValues["level"])} error={errors.level} columns={4} />
            <SelectField label="Intended intake" name="intake" placeholder="Choose an intake" options={intakes} value={values.intake} onChange={(e) => set("intake", e.target.value)} error={errors.intake} />
          </>
        )}

        {step === 2 && (
          <>
            <TextAreaField
              label="Academic background"
              name="academicBackground"
              placeholder="e.g. B.Tech in Mechanical Engineering, 2025, 7.8 CGPA. IELTS 7.0."
              hint="Your most recent qualification, year and results. Please don't upload or paste documents here."
              value={values.academicBackground}
              onChange={(e) => set("academicBackground", e.target.value)}
              error={errors.academicBackground}
              maxLength={600}
            />
            <SelectField label="Approximate yearly budget (tuition and living)" name="budgetRange" placeholder="Choose a range" options={budgetOptions} value={values.budgetRange} onChange={(e) => set("budgetRange", e.target.value as FormValues["budgetRange"])} error={errors.budgetRange} />
            <SelectField label="Where are you in the process?" name="applicationStatus" placeholder="Choose one" options={applicationStatusOptions} value={values.applicationStatus} onChange={(e) => set("applicationStatus", e.target.value as FormValues["applicationStatus"])} error={errors.applicationStatus} />
          </>
        )}

        {step === 3 && (
          <>
            <ChoiceGroup legend="How would you like to talk?" name="consultationMethod" value={values.consultationMethod} options={consultationOptions} onChange={(v) => set("consultationMethod", v as FormValues["consultationMethod"])} error={errors.consultationMethod} columns={4} />
            <TextAreaField label="Anything else we should know?" name="message" optional value={values.message ?? ""} onChange={(e) => set("message", e.target.value)} error={errors.message} maxLength={1500} />
            <div className="grid gap-4 border-t border-border pt-5">
              <CheckboxField name="privacyAcknowledged" checked={values.privacyAcknowledged} onChange={(c) => set("privacyAcknowledged", c)} error={errors.privacyAcknowledged}>
                I have read the{" "}
                <Link href="/privacy" target="_blank" className="font-medium text-primary underline underline-offset-4">
                  privacy notice<span className="sr-only"> (opens in a new tab)</span>
                </Link>
                .
              </CheckboxField>
              <CheckboxField name="contactConsent" checked={values.contactConsent} onChange={(c) => set("contactConsent", c)} error={errors.contactConsent}>
                AsterPath may contact me by email, WhatsApp or phone about this enquiry.
              </CheckboxField>
              <CheckboxField name="updatesConsent" checked={values.updatesConsent} onChange={(c) => set("updatesConsent", c)}>
                <span>
                  Send me occasional updates about intakes and deadlines. <span className="text-muted">Optional — unsubscribe any time.</span>
                </span>
              </CheckboxField>
            </div>
          </>
        )}
      </div>

      {status.kind === "failed" && (
        <div className="mt-6 rounded-xl border border-warning-border bg-warning-bg p-4 text-[0.9375rem] text-warning-fg" role="alert">
          <p>{status.message}</p>
          <a href={whatsappUrl(whatsappSummary())} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 font-medium underline underline-offset-4">
            <MessageCircle className="size-4" aria-hidden="true" /> {status.offline ? "Send your enquiry on WhatsApp" : "Message us on WhatsApp"}
          </a>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
            <ArrowLeft aria-hidden="true" /> Back
          </Button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            Continue <ArrowRight aria-hidden="true" />
          </Button>
        ) : (
          <Button type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Sending…" : "Send enquiry"}
          </Button>
        )}
      </div>
    </form>
  );
}
