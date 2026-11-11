import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { upcomingDestinations } from "@/content/destinations";
import { studyLevels } from "@/content/italy/levels";
import { regions } from "@/content/italy/regions";
import { universities } from "@/content/italy/universities";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/study-in-italy",
    ...studyLevels.map((l) => `/study-in-italy/${l.slug}`),
    "/universities",
    ...universities.map((u) => `/universities/${u.slug}`),
    ...regions.map((r) => `/regions/${r.slug}`),
    "/scholarships",
    "/services",
    "/destinations",
    ...upcomingDestinations.map((d) => `/destinations/${d.slug}`),
    "/process",
    "/documents",
    "/pricing",
    "/about",
    "/contact",
    "/legal/terms",
    "/legal/privacy",
    "/legal/refunds",
    "/legal/disclaimer",
  ];
  return paths.map((path) => ({ url: `${siteConfig.url}${path}` }));
}
