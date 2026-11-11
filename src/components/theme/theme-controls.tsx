"use client";

import { useEffect, useSyncExternalStore, type KeyboardEvent } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { setPreference, subscribeTheme, themeSnapshot, watchTheme, type ResolvedTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Mounted once in the root layout: follows device changes and other tabs. */
export function ThemeWatcher() {
  useEffect(() => watchTheme(), []);
  return null;
}

function useTheme(): { preference: ThemePreference; resolved: ResolvedTheme } | null {
  // Server snapshot is null: the stored preference is only known in the browser.
  const snapshot = useSyncExternalStore(subscribeTheme, themeSnapshot, () => null);
  if (!snapshot) return null;
  const [preference, resolved] = snapshot.split(":") as [ThemePreference, ResolvedTheme];
  return { preference, resolved };
}

/**
 * Compact header toggle. The icon is chosen by CSS from <html data-theme>, so it
 * is correct on first paint, before React has read the stored preference.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const next: ResolvedTheme = theme?.resolved === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      aria-label={theme ? `Switch to ${next} theme` : "Toggle colour theme"}
      title={theme ? `Switch to ${next} theme` : "Toggle colour theme"}
      className={cn("inline-flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink", className)}
    >
      <Sun className="size-[1.125rem] dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-[1.125rem] dark:block" aria-hidden="true" />
    </button>
  );
}

const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
];

/** Full three-way choice for the footer and mobile menu, including "follow my device". */
export function ThemeSwitcher({ className, showLabels = false }: { className?: string; showLabels?: boolean }) {
  const theme = useTheme();
  const current = theme?.preference ?? "system";

  // Radio-group keyboard pattern: arrows move the selection, Tab leaves the group.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[event.key];
    if (!step) return;
    event.preventDefault();
    const index = options.findIndex((o) => o.value === current);
    const nextIndex = (index + step + options.length) % options.length;
    setPreference(options[nextIndex]!.value);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
  };

  return (
    <div role="radiogroup" aria-label="Colour theme" onKeyDown={onKeyDown} className={cn("inline-flex rounded-full bg-ink/[0.05] p-1 ring-1 ring-border ring-inset", className)}>
      {options.map(({ value, label, icon: Icon }) => {
        const checked = theme?.preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={value === current ? 0 : -1}
            aria-label={showLabels ? undefined : `${label} theme`}
            onClick={() => setPreference(value)}
            className={cn(
              "inline-flex h-11 min-w-11 items-center sm:h-9 sm:min-w-9 justify-center gap-2 rounded-full px-2.5 text-sm transition-colors",
              checked ? "bg-card text-ink shadow-[var(--shadow-card)] ring-1 ring-border" : "text-muted hover:text-ink",
              showLabels && "flex-1 px-4",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {showLabels && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
