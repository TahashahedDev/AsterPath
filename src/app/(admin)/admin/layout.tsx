import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { TeamRole } from "@/lib/supabase/types";
import { getMfaStatus } from "@/server/auth/mfa";
import { getViewer } from "@/server/auth/viewer";

export const metadata: Metadata = { title: "Admin workspace", robots: { index: false, follow: false } };


const roleLabels: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Administrator",
  advisor: "Advisor",
  document_reviewer: "Document reviewer",
  finance: "Finance",
  marketing: "Marketing",
  analyst: "Analyst",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (viewer.status === "not-configured") {
    // Without Supabase this is a layout preview, never served in production.
    if (process.env.NODE_ENV === "production") notFound();
    return (
      <DashboardShell area="admin">
        {children}
      </DashboardShell>
    );
  }
  if (viewer.status === "signed-out") redirect("/staff/sign-in?next=/admin");
  // Students and deactivated staff get the same answer as a missing page.
  if (!viewer.role) notFound();
  // Staff must finish two-factor sign-in; the database refuses staff data without it anyway.
  if ((await getMfaStatus()) !== "verified") redirect("/staff/mfa");
  return (
    <DashboardShell area="admin" account={{ name: viewer.name ?? viewer.email, detail: roleLabels[viewer.role] }}>
      {children}
    </DashboardShell>
  );
}
