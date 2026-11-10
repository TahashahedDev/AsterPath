"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Copy, Save } from "lucide-react";
import { saveQuote, type FormState } from "@/app/(admin)/admin/crm/actions";
import { discountRules } from "@/content/pricing";
import { degreeLabels, type DegreeLevel } from "@/features/operations/types";
import { buildQuote, type QuoteInput } from "@/features/pricing/quote";
import { formatInr } from "@/lib/utils";

const field = "h-10 w-full rounded-lg border border-border-strong bg-paper px-3 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

function Toggle({ id, label, hint, checked, onChange }: { id: string; label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-lg px-1 py-1.5 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]" />
      <span>
        <span className="font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Internal calculator for written proposals. With a lead, the figure can be saved to it (recomputed on the server); otherwise copy the summary. */
export function QuoteBuilder({ lead }: { lead?: { id: string; reference: string; name: string } }) {
  const [input, setInput] = useState<QuoteInput>({ level: "masters", applications: 5, needsEnglishTest: true, needsTranslations: false, recognition: "cimea", dsu: true, referral: false, earlyStart: false, extraDiscountPercent: 0 });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<FormState>({ status: "idle" });
  const [saving, startSaving] = useTransition();
  const q = useMemo(() => buildQuote(input), [input]);
  const set = <K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) => setInput((i) => ({ ...i, [key]: value }));

  const summary = [
    `AsterPath plan — ${degreeLabels[input.level]} (${input.applications} applications)`,
    `Total: ${formatInr(q.total)}, all-inclusive except flights`,
    `  AsterPath service: ${formatInr(q.serviceFee - q.discountTotal)}${q.discountTotal ? ` (after ${formatInr(q.discountTotal)} discount)` : ""}`,
    `  Costs we pay or credit back for you (allowance, unspent amount refunded): ${formatInr(q.allowance)}`,
    "  Enrolment, visa and residence permit fees are paid by you and credited back against your receipts.",
    "Instalments:",
    ...q.instalments.map((i) => `  ${i.stage}: ${formatInr(i.amount)} — ${i.when}`),
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="grid content-start gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="q-level" className="mb-1.5 block text-xs font-medium text-muted">Level</label>
            <select id="q-level" className={field} value={input.level} onChange={(e) => set("level", e.target.value as DegreeLevel)}>
              {(Object.keys(degreeLabels) as DegreeLevel[]).map((l) => (
                <option key={l} value={l}>{degreeLabels[l]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="q-apps" className="mb-1.5 block text-xs font-medium text-muted">Applications</label>
            <input id="q-apps" type="number" min={1} max={10} className={field} value={input.applications} onChange={(e) => set("applications", Number(e.target.value) || 1)} />
          </div>
        </div>
        <div>
          <label htmlFor="q-rec" className="mb-1.5 block text-xs font-medium text-muted">Qualification recognition</label>
          <select id="q-rec" className={field} value={input.recognition} onChange={(e) => set("recognition", e.target.value as QuoteInput["recognition"])}>
            <option value="cimea">CIMEA statement (paid)</option>
            <option value="free-dov">Free study DOV from the Italian mission</option>
          </select>
        </div>
        <fieldset className="grid gap-0.5 rounded-xl border border-border p-3">
          <legend className="px-1 text-xs font-medium text-muted">What the student needs</legend>
          <Toggle id="q-eng" label="English test fee" hint="Off if they already hold a valid score" checked={input.needsEnglishTest} onChange={(v) => set("needsEnglishTest", v)} />
          <Toggle id="q-trans" label="Certified translations" hint="Only for documents not issued in English" checked={input.needsTranslations} onChange={(v) => set("needsTranslations", v)} />
          <Toggle id="q-dsu" label="DSU scholarship (ISEE parificato)" checked={input.dsu} onChange={(v) => set("dsu", v)} />
        </fieldset>
        <fieldset className="grid gap-0.5 rounded-xl border border-border p-3">
          <legend className="px-1 text-xs font-medium text-muted">Discounts (service fee only)</legend>
          <Toggle id="q-early" label={`Early start — ${discountRules.earlyStart.percent}%`} hint={`Signing ${discountRules.earlyStart.monthsBefore}+ months before the intake`} checked={input.earlyStart} onChange={(v) => set("earlyStart", v)} />
          <Toggle id="q-ref" label={`Referral credit — ${formatInr(discountRules.referralCredit.amount)}`} checked={input.referral} onChange={(v) => set("referral", v)} />
          <div className="px-1 pt-2">
            <label htmlFor="q-extra" className="mb-1.5 block text-xs font-medium text-muted">Owner-approved extra discount (max {discountRules.maxExtraPercent}%)</label>
            <input id="q-extra" type="number" min={0} max={discountRules.maxExtraPercent} className={field} value={input.extraDiscountPercent} onChange={(e) => set("extraDiscountPercent", Number(e.target.value) || 0)} />
          </div>
        </fieldset>
      </div>

      <div className="rounded-[var(--radius-card)] bg-inverse p-6 text-on-inverse">
        <p className="text-xs font-semibold tracking-[0.16em] text-accent-on-inverse uppercase">Written figure</p>
        <p className="display mt-2 text-5xl tabular-nums" aria-live="polite">{formatInr(q.total)}</p>
        <p className="mt-1 text-sm text-on-inverse/70">All-inclusive except flights and the fees students must pay themselves.</p>

        <dl className="mt-6 grid gap-2 border-t border-on-inverse/15 pt-4 text-sm">
          <div className="flex justify-between gap-4"><dt>AsterPath service fee</dt><dd className="tabular-nums">{formatInr(q.serviceFee)}</dd></div>
          {q.discounts.map((d) => (
            <div key={d.id} className="flex justify-between gap-4 text-accent-on-inverse"><dt>− {d.label}</dt><dd className="tabular-nums">−{formatInr(d.amount)}</dd></div>
          ))}
          {q.passThrough.map((l) => (
            <div key={l.id} className="flex justify-between gap-4 text-on-inverse/75"><dt>{l.label}</dt><dd className="tabular-nums">{formatInr(l.amount)}</dd></div>
          ))}
          <div className="flex justify-between gap-4 text-on-inverse/75"><dt>Buffer (10%, refunded if unspent)</dt><dd className="tabular-nums">{formatInr(q.buffer)}</dd></div>
        </dl>

        <ol className="mt-6 grid gap-2 border-t border-on-inverse/15 pt-4 text-sm">
          {q.instalments.map((i, n) => (
            <li key={i.stage} className="grid grid-cols-[1.5rem_1fr_auto] gap-2">
              <span className="display text-accent-on-inverse">{n + 1}</span>
              <span>
                {i.stage}
                <span className="block text-xs text-on-inverse/60">{i.when}</span>
              </span>
              <span className="tabular-nums">{formatInr(i.amount)}</span>
            </li>
          ))}
        </ol>

        <button type="button" onClick={copy} className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full bg-on-inverse/10 px-4 text-sm font-medium ring-1 ring-on-inverse/20 hover:bg-on-inverse/15">
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy proposal summary"}
        </button>
        {lead && (
          <button
            type="button"
            disabled={saving}
            onClick={() => startSaving(async () => setSaved(await saveQuote(lead.id, input)))}
            className="mt-3 ml-0 inline-flex min-h-10 items-center gap-2 rounded-full bg-accent-on-inverse px-4 text-sm font-medium text-inverse hover:opacity-90 disabled:opacity-60 sm:ml-3"
          >
            <Save className="size-4" aria-hidden="true" /> {saving ? "Saving…" : `Save to ${lead.name} (${lead.reference})`}
          </button>
        )}
        {saved.message && (
          <p role={saved.status === "saved" ? "status" : "alert"} className="mt-3 text-sm text-accent-on-inverse">
            {saved.message}
          </p>
        )}
      </div>
    </div>
  );
}
