import Link from "next/link";
import { CalendarClock, MessageCircle, Video } from "lucide-react";
import { Panel, StatusPill } from "@/components/dashboard/ui";
import { firstReplyWhatsappUrl } from "@/features/leads/reply";
import { degreeLabels, type Lead } from "@/features/operations/types";
import type { BookingRow } from "@/lib/supabase/types";

const callFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

function waitingFor(createdAt: string, now: number) {
  const hours = Math.floor((now - Date.parse(createdAt)) / 3_600_000);
  return hours < 1 ? "just now" : hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

/**
 * The founder's first screen: who is waiting for a first reply (one tap opens
 * WhatsApp with the message written) and which calls are coming up (one tap
 * joins the Google Meet).
 */
export function FounderToday({ leads, bookings, now }: { leads: Lead[]; bookings: BookingRow[] | null; now: number }) {
  const waiting = leads.filter((l) => l.stage === "new").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Panel title={`Waiting for a first reply (${waiting.length})`}>
        {waiting.length === 0 ? (
          <p className="text-sm text-muted">Everyone has had a reply. New enquiries appear here and in your email.</p>
        ) : (
          <ul className="divide-y divide-border">
            {waiting.slice(0, 6).map((l) => {
              const late = now - Date.parse(l.createdAt) > 24 * 3_600_000;
              return (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link href={`/admin/leads/${l.id}`} className="font-medium text-ink hover:text-primary">{l.name}</Link>
                    <p className="text-xs text-muted">
                      {degreeLabels[l.level]} · {l.intake} · <span className={late ? "font-semibold text-danger" : ""}>{waitingFor(l.createdAt, now)}</span>
                    </p>
                  </div>
                  <a
                    href={firstReplyWhatsappUrl({ name: l.name, email: l.email, whatsapp: l.whatsapp, reference: l.reference, levelLabel: degreeLabels[l.level] })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-deep"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" /> Reply on WhatsApp
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
      <Panel title="Upcoming calls">
        {bookings === null ? (
          <p className="text-sm text-muted">Calls booked through Cal.com appear here once Supabase and the Cal.com webhook are connected.</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted">No calls booked in the next two weeks.</p>
        ) : (
          <ul className="divide-y divide-border">
            {bookings.slice(0, 6).map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  {b.lead_id ? (
                    <Link href={`/admin/leads/${b.lead_id}`} className="font-medium text-ink hover:text-primary">{b.attendee_name}</Link>
                  ) : (
                    <span className="font-medium text-ink">{b.attendee_name}</span>
                  )}
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <CalendarClock className="size-3.5" aria-hidden="true" /> {callFmt.format(new Date(b.starts_at))}
                    {!b.lead_id && <StatusPill className="ml-1">No enquiry yet</StatusPill>}
                  </p>
                </div>
                {b.meeting_url && (
                  <a href={b.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink ring-1 ring-border-strong hover:bg-ink/5">
                    <Video className="size-4" aria-hidden="true" /> Join Meet
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
