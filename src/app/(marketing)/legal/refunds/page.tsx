import type { Metadata } from "next";
import { legalEntity } from "@/config/site";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Refund and cancellation policy",
  description: "How cancellation and refunds work for AsterPath's instalment-based services.",
  alternates: { canonical: "/legal/refunds" },
};

const sections: LegalSection[] = [
  {
    id: "principle",
    heading: "The principle",
    body: [
      <p key="a">
        You pay in instalments, each linked to a stage of work. You pay for work as it begins, never for stages that have not started. That is the basis
        of everything below.
      </p>,
    ],
  },
  {
    id: "consultation",
    heading: "Free consultation",
    body: [<p key="a">The first consultation is free. Nothing is payable unless you sign a written agreement.</p>],
  },
  {
    id: "cancel",
    heading: "Cancelling",
    body: [
      <ul key="a">
        <li>You can cancel at any time by writing to us. Instalments for stages that have not started are never due after cancellation.</li>
        <li>If you cancel before any work has started, we refund everything you have paid, minus payment-processing charges.</li>
        <li>Once work on a stage has started, the instalment for that stage is not refundable, because the work is already being delivered.</li>
      </ul>,
    ],
  },
  {
    id: "allowance",
    heading: "Costs we pay or credit back for you",
    body: [
      <p key="a">
        Your plan includes an allowance for the third-party costs it lists, such as the English test, application fees, attestation and visa insurance,
        and for the fees you must pay yourself and we credit back (the enrolment fee, the visa fee and the residence permit fee). We show you receipts for
        what we spend. Whatever is left of the allowance at the end, or when you cancel, is refunded to you in full.
      </p>,
    ],
  },
  {
    id: "third-party",
    heading: "Fees already paid to third parties",
    body: [
      <p key="a">
        University, government and embassy fees already paid on your behalf are set by those institutions and cannot be recovered by us. Where an
        institution refunds a fee to us, we pass it on to you in full.
      </p>,
    ],
  },
  {
    id: "outcomes",
    heading: "Refusals and rejections",
    body: [
      <ul key="a">
        <li>We do not guarantee admission, scholarship or visa outcomes, so a refusal does not in itself entitle you to a refund of stages already delivered.</li>
        <li>If your visa is refused, the final Arrival instalment is never charged.</li>
        <li>
          If your visa is refused, we prepare one re-application, for the same intake or the next, at no extra service fee. Any new third-party fees are
          charged at cost.
        </li>
      </ul>,
    ],
  },
  {
    id: "our-failure",
    heading: "If we fall short",
    body: [
      <p key="a">
        If we fail to deliver a stage we were paid for — for example, we miss a deadline that was within our control — we refund the instalment for that
        stage in full, in addition to any other rights you have.
      </p>,
    ],
  },
  {
    id: "process",
    heading: "How refunds are paid",
    body: [
      <p key="a">
        Approved refunds are paid to the original payment method within 14 working days. Write to {legalEntity.grievanceEmail} with your reference to
        request one.
      </p>,
    ],
  },
];

export default function RefundsPage() {
  return <LegalPage title="Refund and cancellation policy" version="draft-2026-11 (not yet in force)" intro={<p>Simple rules, written in plain language, and repeated in your written agreement.</p>} sections={sections} />;
}
