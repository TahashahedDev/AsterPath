import { z } from "zod";

/**
 * Field rules shared by every form, in the browser and on the server. Each one
 * normalises before it validates (Unicode NFC, invisible characters removed,
 * whitespace tidied), so what is stored is what a person would read.
 */

// C0/C1 control characters except tab and newline, plus zero-width and bidi
// override characters, which can hide or reorder text in the admin and in email.
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;
// Only explicit links: bare words with dots ("B.Com", "Node.js") are ordinary text here.
const URL_LIKE = /(?:https?:\/\/|www\.)\S+/i;

/** NFC, invisible characters removed, runs of spaces collapsed, trimmed. One line. */
export function cleanLine(value: string): string {
  return value.normalize("NFC").replace(INVISIBLE, "").replace(/\s+/g, " ").trim();
}

/** As cleanLine, but keeps line breaks (at most one blank line in a row). */
export function cleanText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(INVISIBLE, "")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const asString = (label: string) => z.string({ error: `${label} is required` });

/** A single line of free text: required unless min is 0. */
export function singleLine({ label, min = 1, max, allowLinks = false }: { label: string; min?: number; max: number; allowLinks?: boolean }) {
  return asString(label)
    .transform(cleanLine)
    .pipe(
      z
        .string()
        .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
        .max(max, `${label} must be ${max} characters or fewer`)
        .refine((v) => min === 0 && v === "" ? true : /\p{L}|\p{N}/u.test(v), `${label} needs real words`)
        .refine((v) => allowLinks || !URL_LIKE.test(v), `${label} can't contain links`),
    );
}

/** Multi-line free text, such as a message or a note. */
export function multiLine({ label, min = 0, max, maxLinks = 0 }: { label: string; min?: number; max: number; maxLinks?: number }) {
  return asString(label)
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
        .max(max, `${label} must be ${max.toLocaleString("en-IN")} characters or fewer`)
        .refine((v) => (v.match(new RegExp(URL_LIKE.source, "gi"))?.length ?? 0) <= maxLinks, maxLinks === 0 ? `${label} can't contain links` : `${label} can contain at most ${maxLinks} links`),
    );
}

/**
 * A person's name in any script: letters and combining marks, with spaces,
 * apostrophes, hyphens and full stops between them. No digits, symbols or links.
 */
export function personName(label = "Full name") {
  return asString(label)
    .transform(cleanLine)
    .pipe(
      z
        .string()
        .min(2, `${label} is required`)
        .max(120, `${label} must be 120 characters or fewer`)
        .regex(/^[\p{L}\p{M}]+(?:[ .'’-]+[\p{L}\p{M}]+)*\.?$/u, `${label} can only use letters, spaces, apostrophes, hyphens and full stops`),
    );
}

/** Email: lowercased, trimmed, RFC-shaped (Zod's pragmatic pattern), at most 254 characters. */
export function emailAddress(message = "Enter a valid email address") {
  return z.string({ error: message }).transform((v) => cleanLine(v).toLowerCase()).pipe(z.email({ error: message }).max(254, message));
}

/**
 * A WhatsApp number, stored in E.164 (+<country><number>). Accepts the ways
 * people type Indian numbers (98765 43210, 098765 43210, +91-98765-43210,
 * 0091…); any other country needs its + code. Indian mobiles must be ten digits
 * starting 6–9.
 */
export function toE164(raw: string): string | null {
  const value = cleanLine(raw);
  // One optional + at the start (possibly inside a bracket), then digits and separators.
  if (!/^\(?\+?[0-9 ().-]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  const international = /^\(?\+/.test(value) || digits.startsWith("00");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!international) {
    if (/^0[6-9]\d{9}$/.test(digits)) digits = `91${digits.slice(1)}`;
    else if (/^[6-9]\d{9}$/.test(digits)) digits = `91${digits}`;
    else if (!/^91[6-9]\d{9}$/.test(digits)) return null;
  }
  if (digits.startsWith("91")) return /^91[6-9]\d{9}$/.test(digits) ? `+${digits}` : null;
  // E.164: a country code that doesn't start with 0, and 8 to 15 digits in all.
  return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
}

export function whatsappNumber(message = "Enter a valid WhatsApp number, with the country code if outside India") {
  return z.string({ error: message }).transform((v, ctx) => {
    const e164 = toE164(v);
    if (!e164) {
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    }
    return e164;
  });
}

const DAY_MS = 86_400_000;
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/**
 * A calendar date (YYYY-MM-DD) within a window around today, so typos such as
 * 0202 or 2206 are caught. `past` and `future` are in days.
 */
export function dateWithin({ past, future, message, now = () => Date.now() }: { past: number; future: number; message: string; now?: () => number }) {
  return z.iso.date({ error: message }).refine((v) => {
    const today = now();
    return v >= isoDay(today - past * DAY_MS) && v <= isoDay(today + future * DAY_MS);
  }, message);
}

/** An optional date from a form: "" means none. */
export function optionalDateWithin(options: Parameters<typeof dateWithin>[0]) {
  return z.union([z.literal(""), dateWithin(options)]);
}
