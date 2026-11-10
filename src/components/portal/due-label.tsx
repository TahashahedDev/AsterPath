import { formatDate } from "@/components/dashboard/ui";
import { daysUntil } from "@/server/demo/portal";
import { cn } from "@/lib/utils";

/** "Due 14 Nov 2026 · in 4 days", with the relative part toned by urgency. */
export function DueLabel({ iso, prefix = "Due", done = false }: { iso: string; prefix?: string; done?: boolean }) {
  const days = daysUntil(iso);
  const relative = days === 0 ? "today" : days === 1 ? "tomorrow" : days > 0 ? `in ${days} days` : `${-days} days ago`;
  const tone = done ? "text-muted" : days < 0 ? "text-danger" : days <= 7 ? "text-terracotta-deep" : "text-muted";
  return (
    <span className="text-sm text-ink-soft">
      {prefix && `${prefix} `}<time dateTime={iso}>{formatDate(iso)}</time>
      {!done && <span className={cn("font-medium", tone)}> · {relative}</span>}
    </span>
  );
}
