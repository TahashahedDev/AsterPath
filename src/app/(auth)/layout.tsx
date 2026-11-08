import type { Metadata } from "next";
import { AsterMark, Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme/theme-controls";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-inverse p-12 text-on-inverse lg:flex lg:flex-col lg:justify-between">
        <Logo tone="inverse" />
        <AsterMark className="pointer-events-none absolute -right-24 -bottom-24 size-[32rem] opacity-[0.06]" />
        <div className="relative max-w-md">
          <p className="font-serif text-4xl leading-tight">&ldquo;Every step, in one place — what&rsquo;s done, what&rsquo;s next, and who&rsquo;s responsible.&rdquo;</p>
          <p className="mt-6 text-on-inverse/60">The AsterPath student portal</p>
        </div>
      </aside>
      <main id="main" className="flex flex-col px-[max(1rem,env(safe-area-inset-left))] py-6 sm:px-8">
        <div className="flex items-center justify-between lg:justify-end">
          <Logo className="lg:hidden" />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">{children}</div>
      </main>
    </div>
  );
}
