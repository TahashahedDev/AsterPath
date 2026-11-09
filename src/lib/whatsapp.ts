import { siteConfig } from "@/config/site";

/** Builds a wa.me click-to-chat link. The user sends the message themselves — nothing is automated. */
export function whatsappUrl(message: string = siteConfig.whatsapp.defaultMessage, number: string = siteConfig.whatsapp.number): string {
  const digits = number.replace(/\D/g, "");
  if (!digits) throw new Error("WhatsApp number is not configured");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
