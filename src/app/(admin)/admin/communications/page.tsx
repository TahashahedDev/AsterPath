import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircleOff, ShieldAlert } from "lucide-react";
import { DemoNotice, PageHeader, Panel, StatusPill, formatDateTime } from "@/components/dashboard/ui";
import { DemoUnavailable } from "@/components/admin/admin-ui";
import { demoMessages, demoStudents, isDemoWorkspaceEnabled } from "@/server/demo/workspace";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Communications" };

export default function CommunicationsPage() {
  const header = <PageHeader eyebrow="Operations" title="Communications" description="Portal message threads, one per student." />;
  if (!isDemoWorkspaceEnabled()) return <div>{header}<DemoUnavailable module="Communications" /></div>;

  const threads = demoStudents
    .map((s) => ({ student: s, messages: demoMessages.filter((m) => m.studentId === s.id).sort((a, b) => Date.parse(a.at) - Date.parse(b.at)) }))
    .sort((a, b) => (b.messages.at(-1) ? Date.parse(b.messages.at(-1)!.at) : 0) - (a.messages.at(-1) ? Date.parse(a.messages.at(-1)!.at) : 0));

  return (
    <div>
      {header}
      <DemoNotice />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <p role="note" className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-ink-soft">
          <MessageCircleOff className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden="true" />
          <span><strong className="font-semibold text-ink">WhatsApp Business API is not connected.</strong> WhatsApp conversations happen on the team phone and are not mirrored here.</span>
        </p>
        <p role="note" className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-ink-soft">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-terracotta-deep" aria-hidden="true" />
          <span><strong className="font-semibold text-ink">Human approval required.</strong> No outbound message is ever sent automatically; drafts from the <Link href="/admin/ai" className="font-medium text-primary underline-offset-4 hover:underline">AI workspace</Link> need an advisor to review and send.</span>
        </p>
      </div>
      <div className="mt-6 space-y-4">
        {threads.map(({ student, messages }) => (
          <Panel
            key={student.id}
            title={
              <Link href={`/admin/students/${student.id}`} className="underline-offset-4 hover:text-primary hover:underline">
                {student.name}
              </Link>
            }
            action={<StatusPill>{messages.length} {messages.length === 1 ? "message" : "messages"}</StatusPill>}
          >
            {messages.length === 0 ? (
              <p className="text-sm text-muted">No messages in this thread yet.</p>
            ) : (
              <ol className="space-y-3">
                {messages.map((m) => (
                  <li key={m.id} className={cn("max-w-prose rounded-2xl px-4 py-3", m.from === "advisor" ? "ml-auto bg-primary-soft" : "bg-paper-deep")}>
                    <p className="text-sm text-ink">{m.body}</p>
                    <p className="mt-1 text-xs text-muted">
                      {m.authorName} · <time dateTime={m.at}>{formatDateTime(m.at)}</time>
                    </p>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor={`reply-${student.id}`}>Reply to {student.name}</label>
              <input id={`reply-${student.id}`} disabled placeholder="Replies open when portal messaging is connected" className="h-10 min-w-0 flex-1 cursor-not-allowed rounded-lg border border-border-strong bg-paper px-3 text-sm placeholder:text-subtle" />
              <button type="button" disabled className="h-10 cursor-not-allowed rounded-lg border border-border-strong px-4 text-sm font-medium text-subtle">Send</button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
