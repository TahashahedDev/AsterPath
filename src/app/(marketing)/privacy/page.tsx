import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PRIVACY_NOTICE_VERSION } from "@/features/leads/schema";
import { LegalDraft } from "@/components/marketing/legal-draft";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How AsterPath collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDraft
      title="Privacy notice"
      intro={`This is a working draft (version ${PRIVACY_NOTICE_VERSION}) describing how we intend to handle personal information. It will be reviewed by a qualified legal adviser — including against India's Digital Personal Data Protection Act and, where applicable, the EU GDPR — before AsterPath begins operating. The legal entity responsible for your data will be named here once registered.`}
      sections={[
        {
          heading: "What we collect through the enquiry form",
          body: [
            "Your name, email address, WhatsApp number and country of residence; your study goals (destination, level, intake); a short description of your academic background; an approximate budget range; your current application status; your preferred way to talk; and any message you choose to add.",
            "We also record which privacy notice version you acknowledged, your contact consent, and — if you choose — your consent to receive occasional updates. If you arrived from a marketing campaign, we store the campaign parameters and the page you landed on, and the website you came from (its domain only).",
            "We do not ask for passports, bank statements or other documents through the enquiry form.",
          ],
        },
        {
          heading: "Why we use it",
          body: [
            "To respond to your enquiry and arrange a first conversation; to understand which of our services may help you; and, in aggregate, to understand which channels bring students to us. If you opt in, to send occasional updates about intakes and deadlines.",
          ],
        },
        {
          heading: "Who can see it",
          body: [
            "Only AsterPath team members who need it to respond to you. We do not sell your information. Service providers that host our systems will be listed here, with their locations, before launch.",
          ],
        },
        {
          heading: "How long we keep it",
          body: ["Retention periods for enquiries that do not become student cases will be set before launch and published here."],
        },
        {
          heading: "Your choices",
          body: [
            `You can ask to see, correct or delete your information, or withdraw consent for updates, by writing to ${siteConfig.contactEmail}.`,
          ],
        },
        {
          heading: "Artificial intelligence",
          body: [
            "We do not use student documents to train AI models, and we do not send passport, financial or private documents to third-party AI providers by default.",
          ],
        },
      ]}
    />
  );
}
