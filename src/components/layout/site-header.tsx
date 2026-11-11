"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { mainNav } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeSwitcher, ThemeToggle } from "@/components/theme/theme-controls";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [menuTop, setMenuTop] = useState(64);

  // Close the mobile menu after navigation (state adjusted during render, no effect needed).
  if (open && openedAt !== pathname) setOpen(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="bg-inverse text-on-inverse">
        <p className="page-container py-2 text-center text-[0.8125rem] sm:text-sm">
          Now planning the September 2027 intake, with a limited number of students.{" "}
          <Link href="/contact" className="font-medium text-accent-on-inverse underline underline-offset-4 hover:no-underline">
            Book a free consultation
          </Link>
        </p>
      </div>
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-border/70 bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/70">
        <div className="scroll-progress" aria-hidden="true" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>
        <div className="page-container flex h-16 items-center justify-between gap-6">
          <Logo />

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-[0.9375rem] text-ink-soft transition-colors hover:text-ink",
                      isActive(pathname, item.href) && "text-ink [box-shadow:inset_0_-1.5px_0_var(--color-primary)] rounded-none",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link href="/sign-in" className="hidden rounded-full px-3.5 py-2 text-[0.9375rem] text-ink-soft hover:text-ink sm:inline-flex">
              Sign in
            </Link>
            <div className="hidden sm:inline-flex">
              <ButtonLink href="/contact" size="sm" data-track="header: consultation">
                Free consultation
              </ButtonLink>
            </div>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-ink/5 xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => {
                // The banner sits above the bar until it scrolls away, so open the panel from the bar's real edge.
                setMenuTop(headerRef.current?.getBoundingClientRect().bottom ?? 64);
                setOpenedAt(pathname);
                setOpen((value) => !value);
              }}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

      </header>
        {/* Rendered outside <header>: its backdrop-filter would otherwise become the
            containing block for this fixed panel and collapse it to zero height. */}
        <div
          id="mobile-menu"
          hidden={!open}
          style={{ top: menuTop }}
          className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto overscroll-contain bg-paper pb-[env(safe-area-inset-bottom)] xl:hidden"
        >
          <nav aria-label="Mobile" className="page-container flex flex-col py-6">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className="flex items-center justify-between border-b border-border py-4 text-xl font-medium tracking-tight text-ink"
              >
                {item.label}
                {isActive(pathname, item.href) && <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />}
              </Link>
            ))}
            <Link
              href="/about"
              aria-current={isActive(pathname, "/about") ? "page" : undefined}
              className="flex items-center justify-between border-b border-border py-4 text-xl font-medium tracking-tight text-ink"
            >
              About
            </Link>
            <div className="mt-8 grid gap-3">
              <ButtonLink href="/contact" size="lg" data-track="mobile menu: consultation">Free consultation</ButtonLink>
              <ButtonLink href="/sign-in" variant="secondary" size="lg">Sign in</ButtonLink>
            </div>
            <div className="mt-10 flex flex-col gap-3">
              <p className="text-sm text-muted">Appearance</p>
              <ThemeSwitcher showLabels className="w-full" />
            </div>
          </nav>
        </div>
    </>
  );
}
