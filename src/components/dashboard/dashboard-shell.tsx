import Link from "next/link";
import { Construction } from "lucide-react";
import { AsterMark } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme/theme-controls";
import { cn } from "@/lib/utils";

export type ShellNavItem = { label: string; href?: string; phase?: string };

/**
 * Layout foundation shared by the student portal and the admin workspace.
 * Items without an href are not built yet and render as inert labels, never as dead links.
 */
export function DashboardShell({ area, nav, activeHref, children }: { area: string; nav: ShellNavItem[]; activeHref: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <div className="flex items-center gap-3 border-b border-warning-border bg-warning-bg px-4 py-2.5 text-sm text-warning-fg" role="status">
        <Construction className="size-4 shrink-0" aria-hidden="true" />
        <p>
          <strong className="font-medium">Layout preview (development only).</strong> No authentication or data is connected. This route returns 404 in production.
        </p>
      </div>
      <div className="lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="border-b border-border bg-card lg:min-h-[calc(100dvh-2.75rem)] lg:border-r lg:border-b-0">
          <div className="flex h-16 items-center gap-2.5 px-5">
            <Link href="/" className="flex items-center gap-2.5" aria-label="AsterPath home">
              <AsterMark className="size-6" />
              <span className="font-semibold tracking-[-0.03em]">AsterPath</span>
            </Link>
            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-muted">{area}</span>
            <ThemeToggle className="ml-auto" />
          </div>
          <nav aria-label={`${area} navigation`} className="overflow-x-auto px-3 pb-4 lg:overflow-visible">
            <ul className="flex gap-1 lg:flex-col">
              {nav.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      aria-current={item.href === activeHref ? "page" : undefined}
                      className={cn("flex items-center rounded-lg px-3 py-2 text-sm whitespace-nowrap", item.href === activeHref ? "bg-primary-soft font-medium text-primary-deep" : "text-ink-soft hover:bg-ink/5")}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-subtle" aria-disabled="true">
                      {item.label}
                      {item.phase && <span className="text-[0.6875rem] tracking-wide uppercase">{item.phase}</span>}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main id="main" className="px-4 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

export function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-border-strong bg-card/60 p-6">
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
