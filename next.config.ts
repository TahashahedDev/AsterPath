import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Baseline CSP. Next.js injects inline bootstrap scripts, so script-src needs
// 'unsafe-inline' until we move to nonce-based CSP (planned alongside auth,
// when pages become dynamic anyway). Everything else is locked to 'self'.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Pin the workspace root: a stray lockfile higher up the tree would otherwise be picked up.
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  reactStrictMode: true,
  // The site became Italy-only; old multi-country URLs point to their Italy equivalents.
  async redirects() {
    return [
      { source: "/destinations/:path*", destination: "/study-in-italy", permanent: true },
      { source: "/services/visa-preparation", destination: "/documents", permanent: true },
      { source: "/services/scholarship-guidance", destination: "/scholarships", permanent: true },
      { source: "/services/:path*", destination: "/process", permanent: true },
      { source: "/how-it-works", destination: "/process", permanent: true },
      { source: "/privacy", destination: "/legal/privacy", permanent: true },
      { source: "/terms", destination: "/legal/terms", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
