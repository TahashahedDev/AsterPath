import { cn } from "@/lib/utils";

type FlagCode = "italy" | "india";

/** Simplified national flags drawn as SVG (no external assets). */
export function Flag({ code, className, label }: { code: FlagCode; className?: string; label?: string }) {
  return (
    <span className={cn("flag inline-block overflow-hidden rounded-[3px] ring-1 ring-ink/10", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 30 20" className="block size-full" preserveAspectRatio="none">
        {code === "italy" ? (
          <>
            <rect width="10" height="20" fill="#009246" />
            <rect x="10" width="10" height="20" fill="#f4f5f0" />
            <rect x="20" width="10" height="20" fill="#ce2b37" />
          </>
        ) : (
          <>
            <rect width="30" height="6.67" fill="#ff9933" />
            <rect y="6.67" width="30" height="6.67" fill="#f4f5f0" />
            <rect y="13.33" width="30" height="6.67" fill="#138808" />
            <circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" strokeWidth="0.5" />
          </>
        )}
      </svg>
    </span>
  );
}
