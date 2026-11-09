import type { Metadata } from "next";
import { legalEntity, siteConfig } from "@/config/site";
import { PRIVACY_NOTICE_VERSION } from "@/features/leads/schema";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How AsterPath collects, uses, shares and protects your personal data, and your rights.",
  alternates: { canonical: "/legal/privacy" },
};

const sections: LegalSection[] = [
  {
    id: "controller",
    heading: "Who is responsible for your data",
    body: [
      <p key="a">
        {legalEntity.registeredName}, {legalEntity.registeredAddress}, is the data fiduciary (data controller) for personal data collected through this
        website and our services. Contact: {siteConfig.contactEmail}.
      </p>,
    ],
  },
  {
    id: "collect",
    heading: "What we collect",
    body: [
      <p key="a">
        <strong className="font-bold text-ink">Through the enquiry form:</strong> your name, email, WhatsApp number, state of residence, intended study
        level, intake and field, scholarship interest, highest qualification and a short academic summary, English test and passport status, budget
        range, preferred contact method, any message you add, and your consent choices.
      </p>,
      <p key="b">
        <strong className="font-bold text-ink">Campaign information:</strong> if you arrive from an advertisement or link, the campaign parameters in that
        link, the page you first landed on and the website that referred you (its domain only). This is stored only if you submit an enquiry.
      </p>,
      <p key="c">
        <strong className="font-bold text-ink">As a client:</strong> the documents and information needed to deliver your agreed services, shared through a
        secure channel we provide. We never ask for documents through the public enquiry form, WhatsApp or email.
      </p>,
    ],
  },
  {
    id: "purposes",
    heading: "Why we use it",
    body: [
      <ul key="a">
        <li>To respond to your enquiry and arrange your consultation — based on your consent.</li>
        <li>To deliver the services in your agreement, including preparing applications and files you ask us to — based on your consent and our contract with you.</li>
        <li>To send occasional updates about intakes and deadlines — only if you opt in. You can withdraw at any time.</li>
        <li>To understand, in aggregate, which channels bring students to us.</li>
        <li>To meet legal obligations, such as accounting and tax records.</li>
      </ul>,
    ],
  },
  {
    id: "children",
    heading: "Students under 18",
    body: [
      <p key="a">
        If you are under 18, we process your personal data only with the consent of your parent or legal guardian, as required by India&rsquo;s Digital
        Personal Data Protection Act, 2023. We do not track or target advertising at children.
      </p>,
    ],
  },
  {
    id: "sharing",
    heading: "Who we share it with",
    body: [
      <p key="a">We do not sell your personal data. We share it only:</p>,
      <ul key="b">
        <li>With universities, Universitaly, CIMEA, Italian missions, visa centres or translators — only when needed for a step you have asked us to take.</li>
        <li>With service providers that host our systems or send our messages, under contracts requiring them to protect it. [List of providers and their locations to be published before launch.]</li>
        <li>Where the law requires it.</li>
      </ul>,
    ],
  },
  {
    id: "transfers",
    heading: "International transfers",
    body: [
      <p key="a">
        Because our work involves Italy, some of your data is necessarily sent to Italian institutions at your request. Our systems are hosted in [hosting
        region to be confirmed]. Where data is transferred abroad, we use safeguards required by applicable law.
      </p>,
    ],
  },
  {
    id: "retention",
    heading: "How long we keep it",
    body: [
      <p key="a">
        Enquiries that do not become clients are deleted [12 months] after our last contact. Client records are kept for the duration of our services
        and then for [the period required by Indian tax and accounting law]. Identity and academic documents are deleted [6 months] after your services
        end unless you ask us to keep them or the law requires otherwise.
      </p>,
    ],
  },
  {
    id: "security",
    heading: "How we protect it",
    body: [
      <p key="a">
        Access is limited to team members working on your case. Documents are stored privately and shared only through short-lived secure links, and
        access is logged. No system is perfectly secure; if a breach affects you, we will inform you and the authorities as the law requires.
      </p>,
    ],
  },
  {
    id: "rights",
    heading: "Your rights",
    body: [
      <p key="a">
        You can ask to access, correct, update or erase your personal data, withdraw consent, and nominate someone to exercise your rights if you are
        unable to. If the EU GDPR applies to you, you also have rights to restriction, portability and objection. Write to {legalEntity.grievanceEmail}.
        Withdrawing consent does not affect processing already carried out.
      </p>,
      <p key="b">
        Grievance Officer: {legalEntity.grievanceOfficer}, {legalEntity.grievanceEmail}. If you are not satisfied with our response, you may complain to
        the Data Protection Board of India or, where applicable, your local data protection authority.
      </p>,
    ],
  },
  {
    id: "cookies",
    heading: "Cookies and local storage",
    body: [
      <p key="a">
        We do not use advertising or tracking cookies. Your browser stores your theme choice (light or dark) and, for the length of your visit, the campaign
        information described above. Neither is shared with third parties.
      </p>,
    ],
  },
  {
    id: "ai",
    heading: "Artificial intelligence",
    body: [
      <p key="a">
        We do not use your documents to train AI models, and we do not send passport, financial or private documents to third-party AI providers.
      </p>,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      version={`${PRIVACY_NOTICE_VERSION} (not yet in force)`}
      intro={<p>This policy explains what personal data we collect, why, who we share it with and the rights you have — written to meet India&rsquo;s Digital Personal Data Protection Act, 2023 and, where it applies, the EU GDPR.</p>}
      sections={sections}
    />
  );
}
