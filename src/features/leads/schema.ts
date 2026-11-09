import { z } from "zod";

/**
 * Public enquiry form schema, shared by the browser (per-step validation) and the
 * server (authoritative validation). Collects only what an advisor needs for a
 * first conversation about studying in Italy — never documents or financial details.
 */

export const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
] as const;

export const residenceOptions = [...indianStates.map((s) => ({ value: s, label: s })), { value: "outside-india", label: "I live outside India" }] as const;

export const levelOptions = [
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD / research" },
] as const;

export const scholarshipOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
] as const;

export const qualificationOptions = [
  { value: "class-12", label: "Class 12 / higher secondary" },
  { value: "bachelors-3", label: "Bachelor's (3 years)" },
  { value: "bachelors-4", label: "Bachelor's (4 years)" },
  { value: "masters", label: "Master's" },
  { value: "other", label: "Other" },
] as const;

export const englishTestOptions = [
  { value: "ielts", label: "IELTS, taken" },
  { value: "toefl", label: "TOEFL, taken" },
  { value: "other-test", label: "Another test, taken" },
  { value: "planning", label: "Planning to take one" },
  { value: "none", label: "Not yet decided" },
] as const;

export const passportOptions = [
  { value: "valid", label: "I have a valid passport" },
  { value: "applied", label: "Applied / renewing" },
  { value: "none", label: "Not yet" },
] as const;

export const budgetOptions = [
  { value: "under-10l", label: "Under ₹10 lakh per year" },
  { value: "10-20l", label: "₹10 to 20 lakh per year" },
  { value: "20-35l", label: "₹20 to 35 lakh per year" },
  { value: "over-35l", label: "Over ₹35 lakh per year" },
  { value: "not-sure", label: "Not sure yet" },
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
  residence: enumOf(residenceOptions, "Choose where you live"),
});

export const goalsStepSchema = z.object({
  level: enumOf(levelOptions, "Choose a study level"),
  intake: trimmed(2, 40, "Intended intake"),
  fieldOfStudy: trimmed(2, 120, "Field of study"),
  scholarshipInterest: enumOf(scholarshipOptions, "Let us know about scholarships"),
});

export const backgroundStepSchema = z.object({
  highestQualification: enumOf(qualificationOptions, "Choose your highest qualification"),
  academicBackground: trimmed(2, 600, "Academic background"),
  englishTest: enumOf(englishTestOptions, "Choose your English test status"),
  passportStatus: enumOf(passportOptions, "Choose your passport status"),
  budgetRange: enumOf(budgetOptions, "Choose a budget range"),
});

export const preferencesStepSchema = z.object({
  consultationMethod: enumOf(consultationOptions, "Choose how you'd like to talk"),
  message: z.string().trim().max(1500, "Message must be 1,500 characters or fewer").default(""),
  privacyAcknowledged: z.literal(true, { error: "Please confirm you have read the privacy policy" }),
  contactConsent: z.literal(true, { error: "We need your permission to contact you about this enquiry" }),
  // India's DPDP Act requires a parent's or guardian's consent for anyone under 18.
  ageConfirmed: z.literal(true, { error: "Please confirm you are 18 or older, or have your parent's or guardian's consent" }),
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

/** Version of the privacy policy the user acknowledged. Bump when /legal/privacy changes. */
export const PRIVACY_NOTICE_VERSION = "draft-2026-11-b";
