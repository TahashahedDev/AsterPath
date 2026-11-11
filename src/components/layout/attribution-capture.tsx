"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/features/leads/attribution";
import { recordJourney, track } from "@/features/analytics/client";

/**
 * First-touch attribution, the on-device reading journey, and anonymous page and
 * click events for the marketing dashboard. WhatsApp and booking links are
 * recognised by their address; other key buttons carry data-track="label".
 */
export function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
    recordJourney(pathname);
    track("pageview");
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.<HTMLElement>("a[href], button[data-track], [data-track]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("https://wa.me/")) track("whatsapp_click", link.dataset.track ?? link.textContent?.trim());
      else if (href.startsWith("https://cal.com/")) track("booking_click", link.dataset.track);
      else if (link.dataset.track) track("cta_click", link.dataset.track);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
