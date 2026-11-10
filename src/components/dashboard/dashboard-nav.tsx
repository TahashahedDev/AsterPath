"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, Bot, Calculator, CalendarDays, CircleUser, ClipboardList, CreditCard, FileStack, Gift, GraduationCap, Globe2, History, KanbanSquare,
  LayoutDashboard, LifeBuoy, ListChecks, Megaphone, MessagesSquare, Plug, Route, School, Settings, Users, UsersRound, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: LucideIcon };
type NavGroup = { label?: string; items: NavItem[] };

const adminNav: NavGroup[] = [
  {
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Playbook", href: "/admin/playbook", icon: BookOpen },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { label: "CRM", href: "/admin/crm", icon: KanbanSquare },
      { label: "Leads", href: "/admin/leads", icon: UsersRound },
      { label: "Students", href: "/admin/students", icon: GraduationCap },
      { label: "Applications", href: "/admin/applications", icon: ClipboardList },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Document centre", href: "/admin/documents", icon: FileStack },
      { label: "Tasks", href: "/admin/tasks", icon: ListChecks },
      { label: "Calendar", href: "/admin/calendar", icon: CalendarDays },
      { label: "Communications", href: "/admin/communications", icon: MessagesSquare },
      { label: "Universities", href: "/admin/universities", icon: School },
      { label: "Countries", href: "/admin/countries", icon: Globe2 },
    ],
  },
  {
    label: "Revenue & growth",
    items: [
      { label: "Pricing", href: "/admin/pricing", icon: Calculator },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Referrals", href: "/admin/referrals", icon: Gift },
      { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
      { label: "AI workspace", href: "/admin/ai", icon: Bot },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Team", href: "/admin/team", icon: Users },
      { label: "Audit log", href: "/admin/audit", icon: History },
      { label: "Integrations", href: "/admin/integrations", icon: Plug },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const studentNav: NavGroup[] = [
  {
    items: [
      { label: "Overview", href: "/portal", icon: LayoutDashboard },
      { label: "My journey", href: "/portal/journey", icon: Route },
      { label: "Applications", href: "/portal/applications", icon: ClipboardList },
      { label: "Documents", href: "/portal/documents", icon: FileStack },
      { label: "Tasks", href: "/portal/tasks", icon: ListChecks },
      { label: "Payments", href: "/portal/payments", icon: CreditCard },
      { label: "Messages", href: "/portal/messages", icon: MessagesSquare },
      { label: "Referrals", href: "/portal/referrals", icon: Gift },
      { label: "Support", href: "/portal/support", icon: LifeBuoy },
      { label: "Profile", href: "/portal/profile", icon: CircleUser },
    ],
  },
];

export const navFor = { admin: adminNav, student: studentNav } as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" || href === "/portal" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ area }: { area: keyof typeof navFor }) {
  const pathname = usePathname();
  const groups = navFor[area];
  return (
    <nav aria-label={area === "admin" ? "Admin navigation" : "Portal navigation"} className="px-3 pb-4">
      {/* Phones: one scrollable row of pills. Desktop: grouped vertical list. */}
      <ul className="-mx-3 flex gap-1 overflow-x-auto px-3 pb-1 [scrollbar-width:none] lg:hidden">
        {groups.flatMap((g) => g.items).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex min-h-10 items-center gap-2 rounded-full px-3.5 text-sm whitespace-nowrap ring-1 ring-inset", active ? "bg-primary text-on-primary ring-primary" : "text-ink-soft ring-border hover:bg-ink/5")}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="hidden space-y-5 lg:block">
        {groups.map((group, i) => (
          <div key={group.label ?? i}>
            {group.label && <p className="px-3 pb-1.5 text-[0.6875rem] font-semibold tracking-[0.14em] text-subtle uppercase">{group.label}</p>}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                        active ? "bg-primary-soft font-semibold text-primary-deep" : "text-ink-soft hover:bg-ink/5 hover:text-ink",
                      )}
                    >
                      <item.icon className={cn("size-4", active ? "text-primary" : "text-subtle")} aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

