import { ArrowUpRight, Check } from "lucide-react";
import { CONTENT_CHECKED_ON, contentReview, sources, type SourceId } from "@/content/italy/sources";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-soft">
          <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const checkedDate = new Date(CONTENT_CHECKED_ON).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

/** Where the information came from, and when we last checked it. */
export function SourceNote({ ids, className }: { ids: SourceId[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted", className)}>
      <span>Sources, checked {checkedDate}:</span>
      {ids.map((id) => (
        <a key={id} href={sources[id].url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-deep">
          {sources[id].label}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ))}
    </div>
  );
}

/** Honest status of the guidance on a page: researched from official sources, and whether a named reviewer has signed it off. */
export function ReviewStatus({ className }: { className?: string }) {
  const reviewed = contentReview.status === "reviewed" && contentReview.reviewedBy;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-sm", className)}>
      {reviewed ? <Badge tone="primary">Reviewed by {contentReview.reviewedBy}</Badge> : <Badge tone="warning">Checked against official sources</Badge>}
      <span className="text-muted">
        Last checked {checkedDate}. Rules change — we confirm every requirement for your programme before you act on it.
      </span>
    </div>
  );
}
