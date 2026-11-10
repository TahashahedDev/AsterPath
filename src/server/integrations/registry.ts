import "server-only";
import { bookingUrl } from "@/components/booking/booking-embed";
import { siteConfig } from "@/config/site";
import { getServerEnv } from "@/lib/env";
import { supabaseConfig } from "@/lib/supabase/config";

/**
 * Every third-party service AsterPath depends on, with a live check of whether
 * it actually works. A key being present never counts as "connected" on its
 * own: each check makes a harmless, read-only request. Secret values are never
 * returned — only whether each required variable is set.
 */
export type IntegrationStatus = "connected" | "not_configured" | "demo" | "error" | "needs_attention";

export type IntegrationReport = {
  id: string;
  name: string;
  category: "Platform" | "Accounts" | "Bookings" | "Messaging" | "Payments" | "Email" | "AI" | "Analytics";
  description: string;
  status: IntegrationStatus;
  detail: string;
  checkedAt: string;
  requirements: { name: string; set: boolean; secret: boolean }[];
  docsUrl: string;
};

const TIMEOUT_MS = 3500;

async function probe(url: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number } | { ok: false; status: 0; error: string }> {
  try {
    const res = await fetch(url, { ...init, cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS) });
    return { ok: res.ok, status: res.status };
  } catch (error) {
    return { ok: false, status: 0, error: error instanceof Error && error.name === "TimeoutError" ? "timed out" : "unreachable" };
  }
}

const isSet = (value: string | undefined) => Boolean(value && value.trim());

async function checkSupabase(): Promise<Pick<IntegrationReport, "status" | "detail">> {
  let config;
  try {
    config = supabaseConfig();
  } catch {
    return { status: "error", detail: "NEXT_PUBLIC_SUPABASE_URL is not a valid Supabase origin." };
  }
  if (!config) return { status: "not_configured", detail: "No project connected. Sign-in is closed and enquiries cannot be stored in production." };
  const res = await probe(`${config.url}/auth/v1/health`, { headers: { apikey: config.anonKey } });
  if (!res.ok) return { status: "error", detail: `Auth health check failed (${res.status || ("error" in res ? res.error : "no response")}).` };
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  if (!SUPABASE_SERVICE_ROLE_KEY) return { status: "needs_attention", detail: "Reachable, but the server key is missing, so enquiries cannot be saved." };
  return { status: "connected", detail: "Auth reachable. Database access is governed by Row Level Security." };
}

async function checkGoogle(): Promise<Pick<IntegrationReport, "status" | "detail">> {
  let config;
  try {
    config = supabaseConfig();
  } catch {
    config = null;
  }
  if (!config) return { status: "not_configured", detail: "Google sign-in runs through Supabase Auth, which is not connected." };
  try {
    const res = await fetch(`${config.url}/auth/v1/settings`, { headers: { apikey: config.anonKey }, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return { status: "error", detail: `Could not read Supabase Auth settings (${res.status}).` };
    const settings = (await res.json()) as { external?: { google?: boolean } };
    return settings.external?.google
      ? { status: "connected", detail: "Google is enabled as a provider in Supabase Auth." }
      : { status: "needs_attention", detail: "Supabase is connected, but the Google provider is switched off." };
  } catch {
    return { status: "error", detail: "Supabase Auth settings were unreachable." };
  }
}

async function checkCal(): Promise<Pick<IntegrationReport, "status" | "detail">> {
  const raw = process.env.NEXT_PUBLIC_BOOKING_URL;
  if (!raw) return { status: "not_configured", detail: "No booking link. The contact page offers the enquiry form and WhatsApp instead." };
  const url = bookingUrl();
  if (!url) return { status: "error", detail: "NEXT_PUBLIC_BOOKING_URL must be a plain https://cal.com/… link." };
  const res = await probe(url.toString());
  if (res.ok) return { status: "connected", detail: `Booking page responds (${url.pathname}).` };
  return { status: "error", detail: `Booking page did not load (${res.status || "unreachable"}). Check the link in Cal.com.` };
}

async function checkRazorpay(): Promise<Pick<IntegrationReport, "status" | "detail">> {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = getServerEnv();
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return { status: "not_configured", detail: "No keys. Payments are recorded manually; nothing is collected online." };
  if (!RAZORPAY_KEY_ID.startsWith("rzp_test_")) return { status: "needs_attention", detail: "Live keys detected. Live collection stays off until merchant setup and webhook verification are signed off." };
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await probe("https://api.razorpay.com/v1/orders?count=1", { headers: { authorization: `Basic ${auth}` } });
  if (!res.ok) return { status: "error", detail: res.status === 401 ? "Razorpay rejected the test keys." : "Razorpay API unreachable." };
  if (!RAZORPAY_WEBHOOK_SECRET) return { status: "needs_attention", detail: "Test keys work, but no webhook secret is set, so payments cannot be reconciled." };
  return { status: "connected", detail: "Test mode keys verified. Checkout is not exposed to students yet." };
}

async function checkEmail(): Promise<Pick<IntegrationReport, "status" | "detail">> {
  const { RESEND_API_KEY, EMAIL_FROM } = getServerEnv();
  if (!RESEND_API_KEY) return { status: "not_configured", detail: "No provider. No transactional email is sent." };
  const res = await probe("https://api.resend.com/domains", { headers: { authorization: `Bearer ${RESEND_API_KEY}` } });
  if (!res.ok) return { status: "error", detail: res.status === 401 || res.status === 403 ? "Resend rejected the API key." : "Resend unreachable." };
  if (!EMAIL_FROM) return { status: "needs_attention", detail: "Key verified, but EMAIL_FROM (a verified sender) is not set." };
  return { status: "connected", detail: "API key verified. Sending stays off until templates are approved." };
}

export async function checkOllama(): Promise<Pick<IntegrationReport, "status" | "detail"> & { models: string[] }> {
  const { OLLAMA_BASE_URL, OLLAMA_MODEL } = getServerEnv();
  try {
    const res = await fetch(new URL("/api/tags", OLLAMA_BASE_URL), { cache: "no-store", signal: AbortSignal.timeout(2000) });
    if (!res.ok) return { status: "error", detail: `Ollama answered ${res.status}.`, models: [] };
    const body = (await res.json()) as { models?: { name: string }[] };
    const models = (body.models ?? []).map((m) => m.name);
    const hasModel = models.some((m) => m === OLLAMA_MODEL || m.startsWith(`${OLLAMA_MODEL}:`));
    return hasModel
      ? { status: "connected", detail: `Running locally with ${OLLAMA_MODEL}.`, models }
      : { status: "needs_attention", detail: `Ollama is running but ${OLLAMA_MODEL} is not installed.`, models };
  } catch {
    return { status: "not_configured", detail: "LLM not connected: Ollama is not running at the configured address. AI tools are paused; nothing else is affected.", models: [] };
  }
}

export async function getIntegrationReports(): Promise<IntegrationReport[]> {
  const env = getServerEnv();
  const checkedAt = new Date().toISOString();
  const [supabase, google, cal, razorpay, email, ollama] = await Promise.all([checkSupabase(), checkGoogle(), checkCal(), checkRazorpay(), checkEmail(), checkOllama()]);
  return [
    {
      id: "supabase", name: "Supabase", category: "Platform", checkedAt, docsUrl: "https://supabase.com/docs",
      description: "Authentication, PostgreSQL with Row Level Security, and private document storage.",
      requirements: [
        { name: "NEXT_PUBLIC_SUPABASE_URL", set: isSet(process.env.NEXT_PUBLIC_SUPABASE_URL), secret: false },
        { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", set: isSet(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), secret: false },
        { name: "SUPABASE_SERVICE_ROLE_KEY", set: Boolean(env.SUPABASE_SERVICE_ROLE_KEY), secret: true },
      ],
      ...supabase,
    },
    {
      id: "storage", name: "Private document storage", category: "Platform", checkedAt, docsUrl: "https://supabase.com/docs/guides/storage/security/access-control",
      description: "Private Supabase Storage bucket with per-student policies and short-lived signed URLs.",
      requirements: [{ name: "Private bucket + storage policies (migration)", set: false, secret: false }],
      status: "not_configured",
      detail: "Not built yet. No real documents are accepted until the private bucket, policies, signed URLs and upload validation are tested.",
    },
    {
      id: "google", name: "Google sign-in", category: "Accounts", checkedAt, docsUrl: "https://supabase.com/docs/guides/auth/social-login/auth-google",
      description: "OAuth sign-in for students and staff, configured as a Supabase Auth provider.",
      requirements: [{ name: "Google OAuth client (in Supabase dashboard)", set: google.status === "connected", secret: false }],
      ...google,
    },
    {
      id: "cal", name: "Cal.com", category: "Bookings", checkedAt, docsUrl: "https://cal.com/docs",
      description: "Free consultation booking, embedded on the contact page.",
      requirements: [{ name: "NEXT_PUBLIC_BOOKING_URL", set: isSet(process.env.NEXT_PUBLIC_BOOKING_URL), secret: false }],
      ...cal,
    },
    {
      id: "whatsapp", name: "WhatsApp", category: "Messaging", checkedAt, docsUrl: "https://faq.whatsapp.com/5913398998672934",
      description: "Click-to-chat links with prefilled messages. The Business API (automated messages) is a later phase.",
      requirements: [
        { name: "NEXT_PUBLIC_WHATSAPP_NUMBER", set: isSet(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER), secret: false },
        { name: "WhatsApp Business API", set: false, secret: true },
      ],
      status: "connected",
      detail: `Click-to-chat to ${siteConfig.whatsapp.display}. Needs no credentials; Business API not connected.`,
    },
    {
      id: "razorpay", name: "Razorpay", category: "Payments", checkedAt, docsUrl: "https://razorpay.com/docs/payments/server-integration/nodejs/",
      description: "Server-created orders, signature-verified payments and webhooks. Test mode only for now.",
      requirements: [
        { name: "RAZORPAY_KEY_ID", set: Boolean(env.RAZORPAY_KEY_ID), secret: false },
        { name: "RAZORPAY_KEY_SECRET", set: Boolean(env.RAZORPAY_KEY_SECRET), secret: true },
        { name: "RAZORPAY_WEBHOOK_SECRET", set: Boolean(env.RAZORPAY_WEBHOOK_SECRET), secret: true },
      ],
      ...razorpay,
    },
    {
      id: "email", name: "Transactional email (Resend)", category: "Email", checkedAt, docsUrl: "https://resend.com/docs",
      description: "Enquiry confirmations and portal notifications through an adapter; SMTP can replace it.",
      requirements: [
        { name: "RESEND_API_KEY", set: Boolean(env.RESEND_API_KEY), secret: true },
        { name: "EMAIL_FROM", set: Boolean(env.EMAIL_FROM), secret: false },
      ],
      ...email,
    },
    {
      id: "ollama", name: "Ollama (local LLM)", category: "AI", checkedAt, docsUrl: "https://github.com/ollama/ollama/blob/main/docs/api.md",
      description: "Local language model for drafting and knowledge answers. Optional: the product works without it.",
      requirements: [
        { name: "OLLAMA_BASE_URL", set: true, secret: false },
        { name: `Model ${env.OLLAMA_MODEL}`, set: ollama.models.length > 0 && ollama.status === "connected", secret: false },
      ],
      status: ollama.status,
      detail: ollama.detail,
    },
    {
      id: "analytics", name: "Analytics & ads attribution", category: "Analytics", checkedAt, docsUrl: "https://vercel.com/docs/analytics",
      description: "First-touch UTM attribution is stored with each enquiry today. A consented analytics tool and Meta pixel are not installed.",
      requirements: [{ name: "Approved analytics provider + cookie consent", set: false, secret: false }],
      status: "not_configured",
      detail: "UTM attribution works without cookies. No tracking scripts are loaded.",
    },
  ];
}
