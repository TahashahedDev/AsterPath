import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsappFloatingButton } from "@/components/layout/whatsapp-button";
import { AttributionCapture } from "@/components/layout/attribution-capture";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AttributionCapture />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <WhatsappFloatingButton />
    </>
  );
}
