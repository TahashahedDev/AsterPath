import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { upcomingDestinations } from "@/content/destinations";
import { studyLevels } from "@/content/italy/levels";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/study-in-italy",
    ...studyLevels.map((l) => `/study-in-italy/${l.slug}`),
    "/universities",
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
