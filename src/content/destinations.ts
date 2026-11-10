import type { FlagCode } from "@/components/marketing/flag";

/**
 * Destinations AsterPath is opening next. We have no verified requirements,
 * fees, deadlines or visa rules for these yet, so the site publishes none.
 * Only general pointers to official portals we are certain of.
 */
export type UpcomingDestination = {
  slug: "germany" | "france";
  name: string;
  flag: FlagCode;
  summary: string;
  officialPortal: { label: string; url: string; publisher: string };
};

export const upcomingDestinations: UpcomingDestination[] = [
  {
    slug: "germany",
    name: "Germany",
    flag: "germany",
    summary: "We are preparing our Germany guidance. Until it is checked against official sources, we publish no requirements, costs or visa rules.",
    officialPortal: { label: "DAAD", url: "https://www.daad.de", publisher: "German Academic Exchange Service" },
  },
  {
    slug: "france",
    name: "France",
    flag: "france",
    summary: "We are preparing our France guidance. Until it is checked against official sources, we publish no requirements, costs or visa rules.",
    officialPortal: { label: "Campus France", url: "https://www.campusfrance.org", publisher: "Campus France, the French national agency for international students" },
  },
];

export function getUpcomingDestination(slug: string) {
  return upcomingDestinations.find((d) => d.slug === slug);
}
