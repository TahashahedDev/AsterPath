import { Panel, StatCard } from "@/components/dashboard/ui";
import type { MarketingSummary } from "@/lib/supabase/types";

const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "–");
const dayFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="mt-1 h-1.5 rounded-full bg-paper-deep" aria-hidden="true">
      <div className="h-full rounded-full bg-primary" style={{ width: `${max ? Math.max(2, (value / max) * 100) : 0}%` }} />
    </div>
  );
}

/**
 * Anonymous website analytics: visits, the visit → enquiry funnel, the pages and
 * channels that bring enquiries, and which buttons people press. Counts only;
 * no visitor can be identified from anything here.
 */
export function WebsiteAnalytics({ s, days }: { s: MarketingSummary; days: number }) {
  const funnel = [
    { label: "Visits", value: s.visits },
    { label: "Started the enquiry form", value: s.started },
    { label: "Sent an enquiry", value: s.enquiries },
    { label: "Opened WhatsApp", value: s.whatsapp },
    { label: "Opened booking", value: s.booking },
  ];
  const maxDay = Math.max(1, ...s.daily.map((d) => d.visits));
  const maxChannel = Math.max(1, ...s.channels.map((c) => c.visits));
  return (
    <section aria-labelledby="web-title" className="mt-8">
      <h2 id="web-title" className="text-lg font-semibold text-ink">Website, last {days} days</h2>
      <p className="mt-1 text-sm text-muted">Anonymous counts: no cookies, no IP addresses, no names. Visitors whose browser asks not to be tracked are not counted.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Visits" value={s.visits} hint={`${s.pageviews} pages viewed`} />
        <StatCard label="Enquiries" value={s.enquiries} hint={`${pct(s.enquiries, s.visits)} of visits`} />
        <StatCard label="WhatsApp taps" value={s.whatsapp} hint={`${pct(s.whatsapp, s.visits)} of visits`} />
        <StatCard label="On a phone" value={s.mobileShare === null ? "–" : `${s.mobileShare}%`} hint="of visits" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Funnel">
          <ul className="space-y-3">
            {funnel.map((f) => (
              <li key={f.label}>
                <div className="flex justify-between text-sm"><span className="text-ink">{f.label}</span><span className="text-muted tabular-nums">{f.value}</span></div>
                <Bar value={f.value} max={s.visits} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            {s.started > 0 ? `${pct(s.enquiries, s.started)} of people who start the form send it. ` : ""}A low share means the form is losing people: shorten it or test the wording.
          </p>
        </Panel>
        <Panel title="Visits per day">
          {s.daily.length === 0 ? (
            <p className="text-sm text-muted">No visits recorded yet.</p>
          ) : (
            <div className="flex h-36 items-end gap-1" role="img" aria-label={`Daily visits over the last ${days} days, peaking at ${maxDay}`}>
              {s.daily.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col justify-end" title={`${dayFmt.format(new Date(d.day))}: ${d.visits} visits, ${d.enquiries} enquiries`}>
                  <div className="rounded-t bg-primary/80" style={{ height: `${(d.visits / maxDay) * 100}%` }} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Where visitors come from">
          {s.channels.length === 0 ? (
            <p className="text-sm text-muted">No visits yet. Tag your Instagram and ad links with ?utm_source=instagram&amp;utm_campaign=… to see them here by name.</p>
          ) : (
            <ul className="space-y-3">
              {s.channels.map((c) => (
                <li key={c.channel}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate text-ink">{c.channel}</span>
                    <span className="shrink-0 text-muted tabular-nums">{c.visits} visits · {c.enquiries} enquiries ({pct(c.enquiries, c.visits)})</span>
                  </div>
                  <Bar value={c.visits} max={maxChannel} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Most-read pages">
          {s.pages.length === 0 ? (
            <p className="text-sm text-muted">No page views yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {s.pages.map((p) => (
                <li key={p.path} className="flex justify-between gap-3 py-2">
                  <span className="truncate text-ink">{p.path}</span>
                  <span className="shrink-0 text-muted tabular-nums">{p.views} views</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {(s.campaigns.length > 0 || s.ctas.length > 0) && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Campaigns">
            {s.campaigns.length === 0 ? (
              <p className="text-sm text-muted">No tagged campaigns yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {s.campaigns.map((c) => (
                  <li key={c.campaign} className="flex justify-between gap-3 py-2">
                    <span className="truncate text-ink">{c.campaign}</span>
                    <span className="shrink-0 text-muted tabular-nums">{c.visits} visits · {c.enquiries} enquiries</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Buttons pressed">
            <ul className="divide-y divide-border text-sm">
              {s.ctas.map((c) => (
                <li key={c.label} className="flex justify-between gap-3 py-2">
                  <span className="truncate text-ink">{c.label}</span>
                  <span className="shrink-0 text-muted tabular-nums">{c.clicks}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}
    </section>
  );
}
