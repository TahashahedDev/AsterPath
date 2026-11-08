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
    LEAD_STORE: z.enum(["local", "none"]).optional(),
  })
  .transform((env) => ({
    ...env,
    // Local file storage is a development convenience only — never a default in production.
    LEAD_STORE: env.LEAD_STORE ?? (env.NODE_ENV === "production" ? "none" : "local"),
  }))
  .refine((env) => !(env.NODE_ENV === "production" && env.LEAD_STORE === "local"), {
    message: "LEAD_STORE=local is for development only and must not be used in production.",
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
