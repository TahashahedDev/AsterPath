import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/forms/password-forms";
import { getViewer } from "@/server/auth/viewer";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };

/** Reached only through the emailed reset link, which signs the person in first. */
export default async function ResetPasswordPage() {
  const viewer = await getViewer();
  if (viewer.status !== "signed-in") redirect(viewer.status === "not-configured" ? "/sign-in" : "/sign-in?error=link");
  return <ResetPasswordForm />;
}
