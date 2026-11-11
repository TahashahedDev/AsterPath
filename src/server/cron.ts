import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Vercel cron calls carry CRON_SECRET as a bearer token; anything else is refused. */
export function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return Boolean(secret) && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}
