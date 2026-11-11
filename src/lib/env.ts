import "server-only";
import { z } from "zod";

/**
 * Server-side environment, validated once at first use.
 * Optional integrations stay undefined until configured; callers must check
 * for them and show a "not connected" state instead of faking success.
 */
const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    LEAD_STORE: z.enum(["local", "supabase", "none"]).optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
    // Server-only: bypasses Row Level Security. Never prefix with NEXT_PUBLIC_.
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
    // How to find the real client address for rate limiting (see .env.example).
    CLIENT_IP_HEADER: z
      .string()
      .regex(/^[a-z0-9-]{1,64}$/i)
      .transform((name) => name.toLowerCase())
      .optional(),
    TRUSTED_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
    // Optional integrations. Server-only; checked live by server/integrations/registry.ts.
    OLLAMA_BASE_URL: z.url().default("http://127.0.0.1:11434"),
    OLLAMA_MODEL: z.string().min(1).default("llama3.2"),
    RAZORPAY_KEY_ID: z.string().min(8).optional(),
    RAZORPAY_KEY_SECRET: z.string().min(8).optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(8).optional(),
    RESEND_API_KEY: z.string().min(8).optional(),
    EMAIL_FROM: z.string().optional(),
    // Where new-enquiry alerts go (the founder's inbox). Alerts are off until this and Resend are set.
    LEAD_NOTIFY_EMAIL: z.email().optional(),
    // Signing secret for Cal.com booking webhooks (Cal.com → Settings → Developer → Webhooks).
    CAL_WEBHOOK_SECRET: z.string().min(16).optional(),
  })
  .transform((env) => ({
    ...env,
    // Local file storage is a development convenience only — never a default in production.
    // In production enquiries go to Supabase once it is configured, and are refused until then.
    LEAD_STORE:
      env.LEAD_STORE ??
      (env.NODE_ENV !== "production" ? "local" : env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "none"),
  }))
  .refine((env) => !(env.NODE_ENV === "production" && env.LEAD_STORE === "local"), {
    message: "LEAD_STORE=local is for development only and must not be used in production.",
    path: ["LEAD_STORE"],
  })
  .refine((env) => env.LEAD_STORE !== "supabase" || Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY), {
    message: "LEAD_STORE=supabase needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    path: ["LEAD_STORE"],
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (!cached) {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      // List variable names only — never print values.
      const fields = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
      throw new Error(`Invalid server environment:\n  ${fields.join("\n  ")}`);
    }
    cached = parsed.data;
  }
  return cached;
}
