import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Destination, DegreeLevel, Lead, LeadStage, StaffMember } from "@/features/operations/types";
import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LeadRow, LeadStatus } from "@/lib/supabase/types";
import type { LeadRecord } from "@/server/repositories/lead-store";
import { demoLeads, isDemoWorkspaceEnabled } from "@/server/demo/workspace";

/**
 * Where the admin lead list comes from, in order of preference:
 * 1. Supabase `public.leads`, read as the signed-in staff member (RLS decides).
 * 2. The development file store (.data/leads.ndjson) — real enquiries submitted locally.
 * 3. Demo fixtures, outside production only.
 */
export type LeadDirectory =
  | { source: "supabase" | "local"; leads: Lead[] }
  | { source: "demo"; leads: Lead[] }
  | { source: "unavailable"; leads: []; reason: string };

const stageFromStatus: Record<LeadStatus, LeadStage> = {
  new: "new",
  contacted: "contacted",
  consultation_booked: "consultation",
  qualified: "profile_evaluation",
  proposal: "proposal",
  agreement: "agreement",
  payment: "payment",
  converted: "converted",
  closed: "lost",
};

/** "autumn-2027" → "Autumn 2027"; anything else is shown as stored. */
const formatIntake = (value: string) => (value === "undecided" ? "Not decided" : value.replace(/^([a-z]+)-(\d{4})$/, (_, season: string, year: string) => `${season[0]!.toUpperCase()}${season.slice(1)} ${year}`));

const asLevel = (value: string): DegreeLevel => (value === "bachelors" || value === "phd" ? value : "masters");

function attributionSource(attribution: unknown): string {
  if (attribution && typeof attribution === "object" && "utmSource" in attribution && typeof attribution.utmSource === "string") return attribution.utmSource;
  return "Website";
}

/** Reads the attribution stored with an enquiry into what the lead page shows. */
function visitFrom(attribution: unknown): Lead["visit"] {
  if (!attribution || typeof attribution !== "object") return undefined;
  const a = attribution as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  const pages = Array.isArray(a.journey) ? a.journey.filter((p): p is string => typeof p === "string") : [];
  const visit = { source: str(a.utmSource), campaign: str(a.utmCampaign), referrer: str(a.referrer), landingPage: str(a.landingPage), pages };
  return visit.source || visit.campaign || visit.referrer || visit.landingPage || pages.length ? visit : undefined;
}

function fromRow(row: LeadRow): Lead {
  return {
    id: row.id,
    reference: row.reference,
    name: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp,
    residence: row.residence,
    destination: row.destination === "germany" || row.destination === "france" ? row.destination : "italy",
    level: asLevel(row.level),
    intake: formatIntake(row.intake),
    stage: stageFromStatus[row.status],
    lostReason: row.lost_reason ?? undefined,
    visit: visitFrom(row.attribution),
    source: attributionSource(row.attribution),
    advisorId: row.assigned_to,
    tags: [],
    followUpAt: row.follow_up_due_at,
    createdAt: row.created_at,
    lastActivityAt: row.updated_at,
    notes: row.message ? [{ at: row.created_at, authorId: "enquiry", body: row.message }] : [],
  };
}

function fromRecord(record: LeadRecord): Lead {
  // Records written before destinations existed have none: they were all Italy enquiries.
  const destination = (record.goals as { destination?: string }).destination;
  return {
    id: record.id,
    reference: record.reference,
    name: record.contact.fullName,
    email: record.contact.email,
    whatsapp: record.contact.whatsapp,
    residence: record.contact.residence,
    destination: (destination === "germany" || destination === "france" ? destination : "italy") as Destination,
    level: asLevel(record.goals.level),
    intake: formatIntake(record.goals.intake),
    stage: "new",
    visit: visitFrom(record.attribution),
    source: record.attribution?.utmSource ?? "Website",
    advisorId: null,
    tags: [],
    followUpAt: record.followUpDueAt,
    createdAt: record.createdAt,
    lastActivityAt: record.createdAt,
    notes: record.preferences.message ? [{ at: record.createdAt, authorId: "enquiry", body: record.preferences.message }] : [],
  };
}

async function readLocalLeads(): Promise<Lead[]> {
  try {
    const raw = await readFile(path.join(process.cwd(), ".data", "leads.ndjson"), "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => fromRecord(JSON.parse(line) as LeadRecord))
      .reverse();
  } catch {
    return [];
  }
}

export async function getLeadDirectory(): Promise<LeadDirectory> {
  const { LEAD_STORE } = getServerEnv();
  if (LEAD_STORE === "supabase") {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { source: "unavailable", leads: [], reason: "Supabase is not configured." };
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) return { source: "unavailable", leads: [], reason: `Could not read enquiries (${error.code ?? "unknown error"}).` };
    return { source: "supabase", leads: (data ?? []).map(fromRow) };
  }
  if (LEAD_STORE === "local" && process.env.NODE_ENV !== "production") {
    const leads = await readLocalLeads();
    if (leads.length > 0) return { source: "local", leads };
  }
  if (isDemoWorkspaceEnabled()) return { source: "demo", leads: demoLeads };
  return { source: "unavailable", leads: [], reason: "Enquiry storage is not connected." };
}

/** Active team members who can own a lead, for live data only (RLS: 'leads.read'). */
export async function getTeamDirectory(): Promise<StaffMember[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.rpc("team_directory");
  return (data ?? []).map((m) => ({
    id: m.user_id,
    name: m.full_name,
    role: m.role,
    initials: m.full_name.split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase(),
  }));
}
