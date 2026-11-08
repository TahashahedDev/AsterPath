import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell, type ShellNavItem } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = { title: "Student portal", robots: { index: false, follow: false } };

const nav: ShellNavItem[] = [
  { label: "Overview", href: "/portal" },
  { label: "My journey", phase: "P4" },
  { label: "Applications", phase: "P4" },
  { label: "Documents", phase: "P5" },
  { label: "Tasks", phase: "P4" },
  { label: "Payments", phase: "P6" },
  { label: "Messages", phase: "P4" },
  { label: "Resources", phase: "P7" },
  { label: "My profile", phase: "P4" },
  { label: "Support", phase: "P4" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  // Layout preview only until authentication exists (Phase 2).
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <DashboardShell area="Student" nav={nav} activeHref="/portal">
      {children}
    </DashboardShell>
  );
}
