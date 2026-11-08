import { z } from "zod";

/**
 * Public enquiry form schema, shared by the browser (per-step validation) and the
 * server (authoritative validation). Collects only what an advisor needs for a
 * first conversation — never documents or financial details.
 */

export const destinationOptions = [
  { value: "italy", label: "Italy" },
  { value: "germany", label: "Germany" },
  { value: "france", label: "France" },
  { value: "undecided", label: "Not sure yet" },
] as const;

export const pathwayOptions = [
  { value: "study", label: "Study" },
  { value: "work", label: "Work pathway" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

export const levelOptions = [
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
  { value: "other", label: "Other" },
] as const;

export const budgetOptions = [
  { value: "under-10l", label: "Under ₹10 lakh per year" },
  { value: "10-20l", label: "₹10–20 lakh per year" },
  { value: "20-35l", label: "₹20–35 lakh per year" },
  { value: "over-35l", label: "Over ₹35 lakh per year" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

export const applicationStatusOptions = [
  { value: "exploring", label: "Just exploring" },
  { value: "shortlisting", label: "Shortlisting universities" },
  { value: "applying", label: "Already applying" },
  { value: "admitted", label: "Have an offer" },
  { value: "other", label: "Something else" },
] as const;

export const consultationOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "video", label: "Video call" },
  { value: "phone", label: "Phone call" },
  { value: "email", label: "Email" },
] as const;

type Values<T extends readonly { value: string }[]> = [T[number]["value"], ...T[number]["value"][]];
const enumOf = <T extends readonly { value: string }[]>(options: T, message: string) =>
  z.enum(options.map((o) => o.value) as Values<T>, { error: message });

const trimmed = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

export const contactStepSchema = z.object({
  fullName: trimmed(2, 120, "Full name"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")).pipe(z.string().max(254)),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{8,20}$/, "Enter a valid WhatsApp number, including country code")
    .transform((value) => value.replace(/[^\d+]/g, "")),
  countryOfResidence: trimmed(2, 80, "Country of residence"),
});

export const goalsStepSchema = z.object({
  destination: enumOf(destinationOptions, "Choose a destination"),
  pathway: enumOf(pathwayOptions, "Choose a pathway"),
  level: enumOf(levelOptions, "Choose a study level"),
  intake: trimmed(2, 40, "Intended intake"),
});

export const backgroundStepSchema = z.object({
  academicBackground: trimmed(2, 600, "Academic background"),
  budgetRange: enumOf(budgetOptions, "Choose a budget range"),
  applicationStatus: enumOf(applicationStatusOptions, "Choose your current status"),
});

export const preferencesStepSchema = z.object({
  consultationMethod: enumOf(consultationOptions, "Choose how you'd like to talk"),
  message: z.string().trim().max(1500, "Message must be 1,500 characters or fewer").default(""),
  privacyAcknowledged: z.literal(true, { error: "Please confirm you have read the privacy notice" }),
  contactConsent: z.literal(true, { error: "We need your permission to contact you about this enquiry" }),
  updatesConsent: z.boolean().default(false),
});

export const enquiryStepSchemas = [contactStepSchema, goalsStepSchema, backgroundStepSchema, preferencesStepSchema] as const;

const attributionField = z.string().trim().max(200).optional();

export const attributionSchema = z
  .object({
    utmSource: attributionField,
    utmMedium: attributionField,
    utmCampaign: attributionField,
    utmContent: attributionField,
    utmTerm: attributionField,
    landingPage: attributionField,
    referrer: attributionField,
  })
  .strict();

export const enquirySchema = contactStepSchema
  .extend(goalsStepSchema.shape)
  .extend(backgroundStepSchema.shape)
  .extend(preferencesStepSchema.shape)
  .extend({
    attribution: attributionSchema.optional(),
    // Anti-spam: hidden honeypot field and form start time. A filled honeypot is
    // rejected later with a generic message, so bots learn nothing from validation.
    website: z.string().max(200).optional(),
    startedAt: z.number().int().positive(),
  });

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;
export type Attribution = z.output<typeof attributionSchema>;

/** Version of the privacy notice the user acknowledged. Bump when /privacy changes. */
export const PRIVACY_NOTICE_VERSION = "draft-2026-11";
