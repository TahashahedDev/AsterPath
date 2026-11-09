/**
 * Theme preference: "light", "dark" or "system" (follow the device).
 * The preference lives in localStorage; the resolved theme is written to
 * <html data-theme> where the CSS tokens pick it up. Before hydration the same
 * logic runs as the inline script below, so the first paint is already correct.
 */

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "asterpath-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Browser chrome colours (address bar on mobile) — must match --color-paper. */
export const THEME_COLORS: Record<ResolvedTheme, string> = { light: "#f8f5ef", dark: "#0c1513" };

/** Inline, render-blocking script for <head>. Kept tiny and dependency-free. */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var d=p==="dark"||(p!=="light"&&window.matchMedia("${DARK_QUERY}").matches);var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") return preference;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function applyTheme(preference: ThemePreference): void {
  const theme = resolveTheme(preference);
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = THEME_COLORS[theme];
  });
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export function setPreference(preference: ThemePreference): void {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  applyTheme(preference);
  notify();
}

/** Snapshot for useSyncExternalStore: "preference:resolved". */
export function themeSnapshot(): string {
  const preference = readPreference();
  return `${preference}:${resolveTheme(preference)}`;
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Keeps the page in sync with the device setting (when following the system)
 * and with changes made in other tabs. Mounted once from the root layout.
 */
export function watchTheme(): () => void {
  const media = window.matchMedia(DARK_QUERY);
  const onSystemChange = () => {
    if (readPreference() === "system") {
      applyTheme("system");
      notify();
    }
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    applyTheme(readPreference());
    notify();
  };
  applyTheme(readPreference());
  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}
