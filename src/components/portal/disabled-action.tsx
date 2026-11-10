import { Lock } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A button that is intentionally not live yet, with the reason always visible
 * (not hidden in a tooltip) and tied to the button for screen readers.
 */
export function DisabledAction({ id, label, reason, variant = "secondary", className }: { id: string; label: string; reason: React.ReactNode; variant?: "primary" | "secondary"; className?: string }) {
  const reasonId = `${id}-reason`;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button type="button" disabled aria-describedby={reasonId} className={buttonStyles({ variant, size: "md", className: "w-full sm:w-auto" })}>
        <Lock aria-hidden="true" />
        {label}
      </button>
      <p id={reasonId} className="text-xs leading-relaxed text-muted">
        {reason}
      </p>
    </div>
  );
}
