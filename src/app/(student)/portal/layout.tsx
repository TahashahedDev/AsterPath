import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getViewer } from "@/server/auth/viewer";

export const metadata: Metadata = { title: "Student portal", robots: { index: false, follow: false } };


export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (viewer.status === "not-configured") {
    // Without Supabase this is a layout preview, never served in production.
    if (process.env.NODE_ENV === "production") notFound();
    return (
      <DashboardShell area="student">
        {children}
      </DashboardShell>
    );
  }
  if (viewer.status === "signed-out") redirect("/sign-in?next=/portal");
  // The portal is for students; team members work in the admin workspace.
  if (viewer.role) redirect("/admin");
  return (
    <DashboardShell area="student" account={{ name: viewer.name ?? viewer.email, detail: viewer.email }}>
      {children}
    </DashboardShell>
  );
}
