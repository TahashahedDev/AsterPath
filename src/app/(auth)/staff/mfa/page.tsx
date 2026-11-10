import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MfaForm } from "@/components/forms/mfa-form";
import { getMfaStatus } from "@/server/auth/mfa";
import { getViewer } from "@/server/auth/viewer";

export const metadata: Metadata = { title: "Two-factor sign-in", robots: { index: false, follow: false } };

/** Team members land here after their password until their session has a second factor. */
export default async function StaffMfaPage() {
  const viewer = await getViewer();
  if (viewer.status === "not-configured") notFound();
  if (viewer.status === "signed-out") redirect("/staff/sign-in");
  if (!viewer.role) redirect("/portal");

  const status = await getMfaStatus();
  if (status === "verified") redirect("/admin");
  return <MfaForm mode={status === "challenge" ? "challenge" : "enroll"} />;
}
