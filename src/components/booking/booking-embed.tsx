import { ExternalButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";

/**
 * The founder's Cal.com booking page, embedded. Configured with
 * NEXT_PUBLIC_BOOKING_URL (for example https://cal.com/asterpath/consultation).
 * Only plain https://cal.com links are accepted (no credentials, no port);
 * anything else falls back to the form below.
 */
export function bookingUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_BOOKING_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const plain = !url.username && !url.password && !url.port;
    return url.protocol === "https:" && url.hostname === "cal.com" && plain ? url : null;
  } catch {
    return null;
  }
}

export function BookingEmbed() {
  const url = bookingUrl();
  if (!url) {
    return (
      <div className="well p-[var(--space-xl)]">
        <h2 className="text-[length:var(--text-title)]">Online booking opens soon.</h2>
        <p className="mt-3 max-w-[48ch] leading-relaxed text-ink-2">
          Until then, send your details below and we will reply within one working day with times for your call, or message us now.
        </p>
        <ExternalButtonLink href={whatsappUrl()} className="mt-6">
          WhatsApp {siteConfig.whatsapp.display}
        </ExternalButtonLink>
      </div>
    );
  }
  const src = new URL(url);
  src.searchParams.set("embed", "true");
  src.searchParams.set("layout", "month_view");
  return (
    <iframe
      src={src.toString()}
      title="Book a free consultation with AsterPath"
      className="h-[760px] w-full border-0 bg-paper"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      // Cal.com needs scripts, its own storage, forms and popups (calendar links); it may not navigate this page.
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    />
  );
}
