import Link from "next/link";
import { cn } from "@/lib/utils";

/** Compass star: the "aster" that points the way. Primary facets over a gold diagonal. */
export function AsterMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)}>
      <path d="M9.5 9.5 16 14.6 22.5 9.5 17.4 16 22.5 22.5 16 17.4 9.5 22.5 14.6 16Z" fill="var(--color-gold)" />
      <path d="M16 1 18.2 13.8 27 16 18.2 18.2 16 31 13.8 18.2 5 16 13.8 13.8Z" fill="var(--color-primary)" />
      <path d="M16 1 18.2 13.8 16 16ZM27 16 18.2 18.2 16 16ZM16 31 13.8 18.2 16 16ZM5 16 13.8 13.8 16 16Z" fill="var(--color-primary-deep)" />
    </svg>
  );
}

export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "inverse" }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="AsterPath home">
      <AsterMark className="transition-transform duration-500 ease-out group-hover:rotate-45" />
      <span className={cn("text-[1.125rem] font-semibold tracking-[-0.03em]", tone === "ink" ? "text-ink" : "text-on-inverse")}>
        Aster<span className={tone === "ink" ? "text-primary" : "text-accent-on-inverse"}>Path</span>
      </span>
    </Link>
  );
}
