import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell, type ShellNavItem } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = { title: "Admin workspace", robots: { index: false, follow: false } };

const nav: ShellNavItem[] = [
  { label: "Overview", href: "/admin" },
  { label: "Leads", phase: "P3" },
  { label: "Students", phase: "P3" },
  { label: "Applications", phase: "P4" },
  { label: "Countries", phase: "P4" },
  { label: "Universities", phase: "P4" },
  { label: "Courses", phase: "P4" },
  { label: "Documents", phase: "P5" },
  { label: "Tasks", phase: "P3" },
  { label: "Team", phase: "P2" },
  { label: "Payments", phase: "P6" },
  { label: "Packages", phase: "P6" },
  { label: "Discounts", phase: "P6" },
  { label: "Referrals", phase: "P6" },
  { label: "Communications", phase: "P4" },
  { label: "AI workspace", phase: "P7" },
  { label: "Reports", phase: "P6" },
  { label: "Settings", phase: "P2" },
  { label: "Audit logs", phase: "P2" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Layout preview only until authentication and role permissions exist (Phase 2).
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <DashboardShell area="Admin" nav={nav} activeHref="/admin">
      {children}
    </DashboardShell>
  );
}
