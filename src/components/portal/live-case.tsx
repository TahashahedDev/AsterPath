import Link from "next/link";
import { ArrowRight, Check, Compass, ListChecks, Receipt } from "lucide-react";
import { EmptyState, Panel, StatusPill, formatDate } from "@/components/dashboard/ui";
import { stageCopy } from "@/components/portal/journey-copy";
import { instalmentLabels, instalmentTone } from "@/components/portal/tones";
import { applicationStatusLabels, type WorkflowStage } from "@/features/operations/types";
import { discountRules } from "@/content/pricing";
import { whatsappUrl } from "@/lib/whatsapp";
import { formatInr } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type { CaseWithMoney } from "@/server/services/cases";

/** Italy enrols after arrival; elsewhere enrolment comes before the visa. */
export function journeyOf(destination: string): WorkflowStage[] {
  return destination === "italy"
    ? ["profile", "shortlist", "applications", "admission", "pre_enrolment", "visa", "departure", "arrival", "enrolment"]
    : ["profile", "shortlist", "applications", "admission", "enrolment", "visa", "departure", "arrival"];
}

/** Signed in, but no case opened for this email yet. */
export function NoCaseYet() {
  return (
    <div className="mt-8">
      <EmptyState
        icon={Compass}
        title="Your case is not open yet"
        description={
          <>
            Your portal fills in once you&apos;ve signed your agreement and your first instalment is confirmed. Use the same email you gave us at your
            consultation. Questions? <a href={`https://wa.me/${siteConfig.whatsapp.number}`} className="font-medium text-primary underline-offset-4 hover:underline">Message us on WhatsApp</a>.
          </>
        }
      />
    </div>
  );
}

function AwaitingPayment({ c }: { c: CaseWithMoney }) {
  if (c.status !== "awaiting_payment") return null;
  const first = c.instalments[0];
  return (
    <p role="status" className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink-soft">
      Your case opens fully once your {first ? `${first.stage} instalment (${formatInr(first.amount)})` : "first instalment"} is confirmed. Pay only to the
      account details your advisor sends you in writing, never to details shared any other way.
    </p>
  );
}

export function LiveOverview({ c }: { c: CaseWithMoney }) {
  const journey = journeyOf(c.destination);
  const index = Math.max(0, journey.indexOf(c.stage));
  const current = stageCopy[c.stage];
  const next = journey[index + 1];
  const progress = Math.round(((index + 0.5) / journey.length) * 100);
  const openTasks = c.tasks.filter((t) => !t.done);
  const nextPayment = c.instalments.find((i) => i.status === "due") ?? c.instalments.find((i) => i.status === "upcoming");

  return (
    <div className="space-y-6">
      <AwaitingPayment c={c} />
      <section aria-labelledby="journey-hero" className="overflow-hidden rounded-[var(--radius-card)] bg-inverse p-6 text-on-inverse shadow-[var(--shadow-lift)] sm:p-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-accent-on-inverse uppercase">
          Stage {index + 1} of {journey.length}
        </p>
        <h2 id="journey-hero" className="display mt-2 text-3xl sm:text-4xl">{current.title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-inverse/80">{current.you}</p>
        <div role="progressbar" aria-label="Journey progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mt-6 h-2 overflow-hidden rounded-full bg-on-inverse/15">
          <div className="h-full rounded-full bg-accent-on-inverse" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-on-inverse/70">{next ? `Next: ${stageCopy[next].title}` : "Final stage"}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Your next tasks" action={<Link href="/portal/tasks" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary">All tasks <ArrowRight className="size-4" aria-hidden="true" /></Link>}>
          {openTasks.length === 0 ? (
            <p className="text-sm text-muted">Nothing needed from you right now.</p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {openTasks.slice(0, 4).map((t) => (
                <li key={t.id} className="flex justify-between gap-3">
                  <span className="text-ink">{t.title}</span>
                  {t.due_on && <span className="shrink-0 text-muted tabular-nums">{formatDate(t.due_on)}</span>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Next payment" action={<Link href="/portal/payments" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary">Your plan <ArrowRight className="size-4" aria-hidden="true" /></Link>}>
          {nextPayment ? (
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-ink">{nextPayment.stage}</span>
              <span className="display text-2xl tabular-nums">{formatInr(nextPayment.amount)}</span>
            </div>
          ) : (
            <p className="text-sm text-muted">Nothing outstanding.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

export function LiveJourney({ c }: { c: CaseWithMoney }) {
  const journey = journeyOf(c.destination);
  const index = Math.max(0, journey.indexOf(c.stage));
  return (
    <ol className="mt-8 grid gap-3">
      {journey.map((stage, i) => {
        const state = i < index ? "Done" : i === index ? "You are here" : "Upcoming";
        const copy = stageCopy[stage];
        return (
          <li key={stage} aria-current={i === index ? "step" : undefined} className={`rounded-[var(--radius-card)] border bg-card p-5 ${i === index ? "border-primary shadow-[var(--shadow-card)]" : "border-border"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="display text-2xl text-terracotta tabular-nums">{i + 1}</span>
              <h2 className="font-semibold text-ink">{copy.title}</h2>
              <StatusPill tone={i < index ? "success" : i === index ? "primary" : "neutral"}>
                {i < index && <Check className="size-3.5" aria-hidden="true" />} {state}
              </StatusPill>
            </div>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <div><dt className="text-xs text-muted">You</dt><dd className="text-ink-soft">{copy.you}</dd></div>
              <div><dt className="text-xs text-muted">We</dt><dd className="text-ink-soft">{copy.us}</dd></div>
              <div><dt className="text-xs text-muted">Who decides</dt><dd className="text-ink-soft">{copy.decides}</dd></div>
            </dl>
          </li>
        );
      })}
    </ol>
  );
}

export function LiveTasks({ c }: { c: CaseWithMoney }) {
  if (c.tasks.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState icon={ListChecks} title="Nothing to do right now" description="When your advisor needs something from you, it will appear here with a due date." />
      </div>
    );
  }
  return (
    <ul className="mt-8 grid gap-3">
      {c.tasks.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
          <span className={t.done ? "text-muted line-through" : "text-ink"}>{t.title}</span>
          <span className="flex shrink-0 items-center gap-2 text-sm text-muted tabular-nums">
            {t.due_on && formatDate(t.due_on)}
            <StatusPill tone={t.done ? "success" : "gold"}>{t.done ? "Done" : "To do"}</StatusPill>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function LivePayments({ c }: { c: CaseWithMoney }) {
  const total = c.instalments.reduce((s, i) => s + (i.status === "waived" ? 0 : i.amount), 0);
  const paid = c.instalments.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  if (c.instalments.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState icon={Receipt} title="No payment schedule yet" description="Your schedule appears here once your agreement is set up." />
      </div>
    );
  }
  return (
    <div className="mt-8 space-y-6">
      <AwaitingPayment c={c} />
      <section className="rounded-[var(--radius-card)] bg-inverse p-6 text-on-inverse shadow-[var(--shadow-lift)] sm:p-8" aria-label="Plan balance">
        <p className="text-xs font-semibold tracking-[0.16em] text-accent-on-inverse uppercase">Your plan</p>
        <p className="display mt-2 text-4xl tabular-nums">{formatInr(total)}</p>
        <p className="mt-1 text-sm text-on-inverse/75">
          {formatInr(paid)} paid · {formatInr(total - paid)} to come, as each stage begins
        </p>
      </section>
      <ol className="grid gap-3">
        {c.instalments.map((i) => (
          <li key={i.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
            <span className="display text-xl text-terracotta">{i.position}</span>
            <span>
              <span className="font-medium text-ink">{i.stage}</span>
              <span className="block text-xs text-muted">
                {i.status === "paid" && i.paid_at ? `Paid ${formatDate(i.paid_at)}` : i.due_on ? `Due ${formatDate(i.due_on)}` : "Due when this stage begins"}
                {i.stage === "Arrival" && i.status !== "paid" ? " · never charged if your visa is refused" : ""}
              </span>
            </span>
            <span className="flex flex-col items-end gap-1">
              <span className="tabular-nums text-ink">{formatInr(i.amount)}</span>
              <StatusPill tone={instalmentTone[i.status]}>{instalmentLabels[i.status]}</StatusPill>
            </span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted">
        Online payment isn&apos;t switched on. Your advisor sends verified bank details in writing; finance confirms each payment against the bank record and
        it shows here as paid.
      </p>
    </div>
  );
}

const portalAppTone = {
  planned: "neutral", in_preparation: "gold", submitted: "primary", under_review: "primary", admitted: "success", waitlisted: "warning", rejected: "danger", withdrawn: "neutral",
} as const;

export function LivePortalApplications({ c }: { c: CaseWithMoney }) {
  if (c.applications.length === 0) {
    return <div className="mt-8"><EmptyState icon={ListChecks} title="No applications yet" description="Once you and your advisor agree your shortlist, each university appears here with its deadline and status." /></div>;
  }
  return (
    <ul className="mt-8 grid gap-3">
      {c.applications.map((a) => (
        <li key={a.id} className="rounded-[var(--radius-card)] border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-semibold text-ink">{a.university}</h2>
              <p className="text-sm text-muted">{a.programme}</p>
            </div>
            <StatusPill tone={portalAppTone[a.status]}>{applicationStatusLabels[a.status]}</StatusPill>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-muted">Deadline</dt><dd className="text-ink tabular-nums">{a.deadline ? formatDate(a.deadline) : "To be confirmed"}</dd></div>
            <div><dt className="text-xs text-muted">Submitted</dt><dd className="text-ink tabular-nums">{a.submitted_on ? formatDate(a.submitted_on) : "Not yet"}</dd></div>
            {a.portal_reference && <div><dt className="text-xs text-muted">University reference</dt><dd className="font-mono text-ink">{a.portal_reference}</dd></div>}
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function LivePortalReferrals({ c }: { c: CaseWithMoney }) {
  if (!c.referral_code) return null;
  const link = `${siteConfig.url}/?ref=${c.referral_code}`;
  const message = `I'm planning my studies in Italy with AsterPath. If you're thinking about it too, start here: ${link}`;
  const approved = c.referrals.filter((r) => r.status === "approved");
  return (
    <div className="mt-8 grid gap-6">
      <section className="rounded-[var(--radius-card)] bg-inverse p-6 text-on-inverse sm:p-8" aria-label="Your referral link">
        <p className="text-xs font-semibold tracking-[0.16em] text-accent-on-inverse uppercase">Your code</p>
        <p className="display mt-2 text-4xl tracking-wide">{c.referral_code}</p>
        <p className="mt-3 break-all text-sm text-on-inverse/75">{link}</p>
        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-accent-on-inverse px-5 text-sm font-medium text-inverse">
          Share on WhatsApp <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </section>
      <Panel title="How it works">
        <ul className="grid gap-2 text-sm text-ink-soft">
          <li>Your friend gets {formatInr(discountRules.referralCredit.amount)} off our service fee when they join through your link.</li>
          <li>You get {formatInr(discountRules.referralCredit.amount)} off your next instalment once they sign and pay their first instalment.</li>
          <li>We never tell you who used your link or anything about their case.</li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          {c.referrals.length === 0 ? "No one has used your link yet." : `Used ${c.referrals.length} time${c.referrals.length === 1 ? "" : "s"}${approved.length ? `; ${approved.length} credit${approved.length === 1 ? "" : "s"} approved` : ""}.`}
        </p>
      </Panel>
    </div>
  );
}

export function LivePortalProfile({ c, email }: { c: CaseWithMoney; email: string }) {
  const rows: [string, string][] = [
    ["Name", c.full_name],
    ["Email", email],
    ["Destination", c.destination.charAt(0).toUpperCase() + c.destination.slice(1)],
    ["Level", c.level],
    ["Intake", c.intake],
    ["Case opened", formatDate(c.opened_at)],
  ];
  return (
    <div className="mt-8 grid gap-4">
      <Panel title="What we hold">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {rows.map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="text-ink">{v}</dd></div>)}
        </dl>
      </Panel>
      <p className="text-sm text-muted">
        Something wrong? <a href={whatsappUrl(`Hello, please correct my details on my AsterPath case (${c.full_name}).`)} className="font-medium text-primary underline-offset-4 hover:underline">Tell your advisor</a> and they&apos;ll update it.
        To change your password, use <Link href="/forgot-password" className="font-medium text-primary underline-offset-4 hover:underline">reset password</Link>.
      </p>
    </div>
  );
}

/** Documents: honest about secure uploads, clear about what to do meanwhile. */
export function LivePortalDocuments() {
  return (
    <div className="mt-8 grid gap-4">
      <Panel title="Sharing documents">
        <p className="text-sm leading-relaxed text-ink-soft">
          Your advisor gives you a document checklist in your tasks, in the order you&apos;ll need each one. Secure uploads open here soon. Until then,
          please don&apos;t send passports, bank statements or other sensitive documents by WhatsApp or email; your advisor will tell you how to share them safely.
        </p>
        <Link href="/portal/tasks" className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-primary">See your tasks <ArrowRight className="size-4" aria-hidden="true" /></Link>
      </Panel>
    </div>
  );
}

export function LivePortalMessages({ c }: { c: CaseWithMoney }) {
  return (
    <div className="mt-8 grid gap-4">
      <Panel title="Talk to your advisor">
        <p className="text-sm leading-relaxed text-ink-soft">Your advisor replies on WhatsApp within one working day, and sends a weekly update while a stage is active.</p>
        <a href={whatsappUrl(`Hello, this is ${c.full_name} (AsterPath student).`)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-on-primary hover:bg-primary-deep">
          Message on WhatsApp <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </Panel>
    </div>
  );
}
