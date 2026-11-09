import type { Metadata } from "next";
import Link from "next/link";
import { commitments, legalEntity, siteConfig } from "@/config/site";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that govern AsterPath's study-in-Italy consultancy services.",
  alternates: { canonical: "/legal/terms" },
};

const sections: LegalSection[] = [
  {
    id: "who",
    heading: "Who we are",
    body: [
      <p key="a">
        These terms are an agreement between you and {legalEntity.registeredName}, a {legalEntity.entityType} with its registered office at{" "}
        {legalEntity.registeredAddress} (“AsterPath”, “we”, “us”). They apply to our website and to any services we provide to you.
      </p>,
      <p key="b">If you are under 18, your parent or legal guardian must accept these terms on your behalf and remains responsible for the agreement.</p>,
    ],
  },
  {
    id: "services",
    heading: "What we do",
    body: [
      <p key="a">
        We provide guidance and preparation support for students applying to higher education in Italy: profile evaluation, university shortlisting,
        application support, Universitaly pre-enrolment guidance, Declaration of Value or CIMEA preparation, scholarship guidance, study visa file
        preparation, and arrival guidance, as described in your written agreement.
      </p>,
      <p key="b">We do not provide job placement or recruitment services, and we do not provide legal advice.</p>,
    ],
  },
  {
    id: "no-guarantee",
    heading: "No guarantee of outcomes",
    body: [
      <p key="a">
        Admission decisions are made solely by universities. Scholarship decisions are made solely by the awarding bodies. Visa and residence permit
        decisions are made solely by the Italian authorities. AsterPath does not and cannot guarantee any admission, scholarship, visa, permit or
        employment outcome, and no statement by any member of our team should be understood as such a guarantee.
      </p>,
    ],
  },
  {
    id: "your-responsibilities",
    heading: "Your responsibilities",
    body: [
      <ul key="a">
        <li>Provide information that is complete, accurate and truthful, and tell us promptly if anything changes.</li>
        <li>Provide only genuine documents. Submitting false or altered documents is a serious offence; we will stop work immediately and may be required to report it.</li>
        <li>Submit applications from your own accounts, attend appointments in person and meet the deadlines we agree with you.</li>
        <li>Pay third-party costs not included in your package directly or as agreed in writing.</li>
      </ul>,
    ],
  },
  {
    id: "agreement",
    heading: "Quotes and your written agreement",
    body: [
      <p key="a">
        We do not publish prices. Before you pay anything, we give you a written agreement setting out the services included, the total price, the
        instalment schedule, the costs we pay or credit on your behalf, and the refund terms. If anything on the website differs
        from your signed agreement, the agreement prevails.
      </p>,
    ],
  },
  {
    id: "fees",
    heading: "Fees, instalments and included university fees",
    body: [
      <p key="a">
        You pay in instalments as each stage of work begins, as set out in your agreement. Your plan includes the third-party costs it lists (such as
        the English test fee, university application fees, attestation, apostille, translations and visa insurance), which we pay on your behalf.
        Costs that consulate rules require you to pay yourself, such as the university enrolment fee, the visa fee and the visa centre charge, are
        credited back to you as your agreement describes.
      </p>,
      <p key="b">
        Tuition, proof of funds, flights, accommodation and living costs are not included. Applicable taxes are shown on your quote and invoice. [GST treatment to be confirmed.]
      </p>,
    ],
  },
  {
    id: "third-parties",
    heading: "Third parties",
    body: [
      <p key="a">
        Universities, Universitaly, CIMEA, Italian missions, visa application centres, government departments, translators and other providers act
        independently of us. We are not responsible for their decisions, fees, timelines, errors or service interruptions, although we will help you
        respond to them.
      </p>,
    ],
  },
  {
    id: "refunds",
    heading: "Cancellation and refunds",
    body: [
      <p key="a">
        Cancellation and refunds are governed by our{" "}
        <Link href="/legal/refunds" className="font-semibold text-primary underline underline-offset-4">
          refund and cancellation policy
        </Link>{" "}
        and your written agreement.
      </p>,
    ],
  },
  {
    id: "service",
    heading: "Our service commitments",
    body: [
      <p key="a">
        We assign you a named advisor, aim to reply to your messages within {commitments.responseTimeWorkingDays} working day and send{" "}
        {commitments.activeStageUpdateCadence} updates during active stages. If your advisor changes, we introduce your new advisor before handing over.
      </p>,
    ],
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    body: [
      <p key="a">
        To the extent permitted by law, our total liability to you in connection with our services is limited to the fees you have paid us for the
        stage concerned. We are not liable for decisions of third parties or for losses that were not reasonably foreseeable. Nothing in these terms
        limits liability that cannot be limited under applicable law. [To be reviewed by counsel.]
      </p>,
    ],
  },
  {
    id: "ending",
    heading: "Ending the agreement",
    body: [
      <p key="a">
        You may end the agreement at any time by writing to us; the refund policy applies. We may end it if you provide false information or documents,
        do not pay an instalment within [14] days of its due date after a reminder, or behave abusively towards our team.
      </p>,
    ],
  },
  {
    id: "law",
    heading: "Governing law, disputes and grievances",
    body: [
      <p key="a">
        These terms are governed by the laws of India. Courts at {legalEntity.governingCity} have jurisdiction, without affecting any mandatory consumer
        rights you have where you live.
      </p>,
      <p key="b">
        Complaints can be raised with our Grievance Officer, {legalEntity.grievanceOfficer}, at {legalEntity.grievanceEmail}. We acknowledge complaints
        within [48 hours] and aim to resolve them within [30 days].
      </p>,
    ],
  },
  {
    id: "changes",
    heading: "Changes and contact",
    body: [
      <p key="a">
        We may update these terms; the version and date above change when we do. Changes do not affect agreements already signed unless you agree.
        Contact: {siteConfig.contactEmail}.
      </p>,
    ],
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms of service" version="draft-2026-11 (not yet in force)" intro={<p>Please read these terms carefully. They explain what we do, what we do not do, and the rights and responsibilities on both sides.</p>} sections={sections} />;
}
