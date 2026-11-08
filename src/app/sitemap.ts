import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { countries } from "@/content/countries";
import { services } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/destinations",
    ...countries.map((c) => `/destinations/${c.slug}`),
    "/services",
    ...services.map((s) => `/services/${s.slug}`),
    "/how-it-works",
    "/pricing",
    "/contact",
    "/privacy",
    "/terms",
  ];
  return paths.map((path) => ({ url: `${siteConfig.url}${path}` }));
}
