"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";

/**
 * Floating click-to-chat button. Opens WhatsApp with a prefilled message the user can edit.
 * On phones it waits until the visitor scrolls past the first screen, so it never covers the
 * hero's own buttons (which already offer WhatsApp).
 */
export function WhatsappFloatingButton() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > window.innerHeight * 0.75);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 inline-flex size-13 items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-paper shadow-[var(--shadow-lift)] transition-[transform,opacity,visibility] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgb(0_0_0/0.45)] sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:h-12 sm:w-auto sm:pr-5 sm:pl-4",
        // Hidden (and out of the tab order) on phones until the first screen is scrolled past.
        !scrolled && "max-sm:invisible max-sm:translate-y-4 max-sm:opacity-0",
      )}
      aria-label="Chat with AsterPath on WhatsApp (opens in a new tab)"
    >
      <span className="relative flex size-5 items-center justify-center">
        <MessageCircle className="size-5" aria-hidden="true" />
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#3ccf91] ring-2 ring-ink" aria-hidden="true" />
      </span>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
