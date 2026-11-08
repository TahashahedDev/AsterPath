import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardCheck,
  Compass,
  FlaskConical,
  GraduationCap,
  House,
  Languages,
  Plane,
  Scale,
  Send,
  Stamp,
  BookUser,
  type LucideIcon,
} from "lucide-react";
import type { ServiceIcon as ServiceIconName } from "@/content/services";

const icons: Record<ServiceIconName, LucideIcon> = {
  graduation: GraduationCap,
  book: BookOpen,
  flask: FlaskConical,
  building: Building2,
  compass: Compass,
  clipboard: ClipboardCheck,
  send: Send,
  badge: BadgeCheck,
  passport: BookUser,
  briefcase: Briefcase,
  award: Award,
  stamp: Stamp,
  scale: Scale,
  languages: Languages,
  plane: Plane,
  home: House,
};

export function ServiceIcon({ name, className }: { name: ServiceIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} aria-hidden="true" strokeWidth={1.6} />;
}
