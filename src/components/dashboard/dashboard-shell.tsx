import Link from "next/link";
import { Construction, LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { AsterMark } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme/theme-controls";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

/** Layout shared by the student portal and the admin workspace. */
export function DashboardShell({
  area,
  account,
  children,
}: {
  area: "admin" | "student";
  /** The signed-in person. Without it the shell is a development-only layout preview. */
  account?: { name: string; detail: string };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-paper">
      {!account && (
        <div className="flex items-center gap-3 border-b border-warning-border bg-warning-bg px-4 py-2.5 text-sm text-warning-fg" role="status">
          <Construction className="size-4 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-medium">Preview (development only).</strong> Supabase is not connected, so there is no sign-in. This area returns 404 in production until it is.
          </p>
        </div>
      )}
      <div className="lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <aside className="border-b border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
          <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
            <Link href="/" className="flex items-center gap-2.5" aria-label="AsterPath home">
              <AsterMark className="size-6" />
              <span className="font-semibold tracking-[-0.03em]">AsterPath</span>
            </Link>
            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-muted">{area === "admin" ? "Admin" : "Student"}</span>
            <ThemeToggle className="ml-auto" />
          </div>
          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <DashboardNav area={area} />
          </div>
          {account && (
            <div className="flex items-center gap-3 border-t border-border px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{account.name}</p>
                <p className="truncate text-xs text-muted">{account.detail}</p>
              </div>
              <form action={signOut}>
                <button type="submit" className="inline-flex size-9 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink" aria-label="Sign out" title="Sign out">
                  <LogOut className="size-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          )}
        </aside>
        <main id="main" className="min-w-0 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
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
