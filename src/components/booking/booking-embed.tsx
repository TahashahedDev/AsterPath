import { ExternalButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { bookingUrl } from "@/lib/booking";
import { whatsappUrl } from "@/lib/whatsapp";

export function BookingEmbed() {
  const url = bookingUrl();
  if (!url) {
    return (
      <div className="well p-[var(--space-xl)]">
        <h2 className="text-[length:var(--text-title)]">Pick a time with us on WhatsApp</h2>
        <p className="mt-3 max-w-[48ch] leading-relaxed text-ink-2">
          Message us and we&rsquo;ll offer you times for your call within one working day. Or send your details below first, so your advisor has read them
          before you talk.
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
