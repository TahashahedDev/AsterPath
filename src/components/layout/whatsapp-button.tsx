import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

/** Floating click-to-chat button. Opens WhatsApp with a prefilled message the user can edit. */
export function WhatsappFloatingButton() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 inline-flex size-13 items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-paper shadow-[var(--shadow-lift)] transition-transform duration-300 ease-out hover:-translate-y-0.5 sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:h-12 sm:w-auto sm:pr-5 sm:pl-4 motion-safe:animate-[fade_0.8s_1.2s_both]"
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
