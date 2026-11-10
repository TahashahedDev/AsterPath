import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/portal", "/admin", "/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/staff"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
