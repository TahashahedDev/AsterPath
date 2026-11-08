import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "gold" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-ink/[0.04] text-ink-soft ring-border-strong",
  primary: "bg-primary-soft text-primary-deep ring-primary/15",
  gold: "bg-gold-soft text-gold-deep ring-gold/30",
  warning: "bg-warning-bg text-warning-fg ring-warning-border",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}
