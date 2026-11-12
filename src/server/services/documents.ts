import "server-only";
import { createHash } from "node:crypto";
import { checkDocumentFile, fileCheckMessages } from "@/features/documents/files";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DocumentRequestRow, DocumentReviewRow, DocumentTypeRow, DocumentVersionRow } from "@/lib/supabase/types";
import { scanDocument } from "@/server/integrations/malware-scan";
import { createSharedRateLimiter } from "@/server/rate-limit";

/**
 * The student document vault. Authorisation happens in the database, as the
 * signed-in user (RLS and the document functions); the service role is used
 * only afterwards, to sign a URL for a path the database has just approved, and
 * to read back an upload for checking and store the verified copy. Signed links
 * last five minutes.
 */
export const DOCUMENT_BUCKET = "student-documents";
const DOWNLOAD_LINK_SECONDS = 5 * 60;

export type DocumentWithHistory = DocumentRequestRow & { type: DocumentTypeRow | null; versions: DocumentVersionRow[]; reviews: DocumentReviewRow[] };
export type QueueRow = DocumentRequestRow & { type: DocumentTypeRow | null; studentName: string };

type Client = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

async function documentTypes(supabase: Client): Promise<Map<string, DocumentTypeRow>> {
  const { data } = await supabase.from("document_types").select("*").order("sort");
  return new Map((data ?? []).map((t) => [t.key, t]));
}

export async function listDocumentTypes(): Promise<DocumentTypeRow[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  return [...(await documentTypes(supabase)).values()].filter((t) => t.active);
}

/** Every request on one case with its file versions and review history; RLS trims what the viewer may not see. */
export async function listCaseDocuments(caseId: string): Promise<DocumentWithHistory[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const [types, requests] = await Promise.all([documentTypes(supabase), supabase.from("document_requests").select("*").eq("case_id", caseId).order("created_at")]);
  const ids = (requests.data ?? []).map((r) => r.id);
  if (ids.length === 0) return [];
  const [versions, reviews] = await Promise.all([
    supabase.from("document_versions").select("*").in("request_id", ids).in("state", ["active", "superseded", "rejected_file"]).order("version", { ascending: false }),
    supabase.from("document_reviews").select("*").in("request_id", ids).order("created_at", { ascending: false }),
  ]);
  return (requests.data ?? []).map((r) => ({
    ...r,
    type: types.get(r.type_key) ?? null,
    versions: (versions.data ?? []).filter((v) => v.request_id === r.id),
    reviews: (reviews.data ?? []).filter((x) => x.request_id === r.id),
  }));
}

/** One request with its history, for the admin review page. */
export async function getDocument(requestId: string): Promise<(DocumentWithHistory & { studentName: string }) | null | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: r } = await supabase.from("document_requests").select("*").eq("id", requestId).maybeSingle();
  if (!r) return undefined;
  const [types, versions, reviews, kase] = await Promise.all([
    documentTypes(supabase),
    supabase.from("document_versions").select("*").eq("request_id", r.id).in("state", ["active", "superseded", "rejected_file"]).order("version", { ascending: false }),
    supabase.from("document_reviews").select("*").eq("request_id", r.id).order("created_at", { ascending: false }),
    supabase.from("student_cases").select("full_name").eq("id", r.case_id).maybeSingle(),
  ]);
  return { ...r, type: types.get(r.type_key) ?? null, versions: versions.data ?? [], reviews: reviews.data ?? [], studentName: kase.data?.full_name ?? "Student" };
}

export type QueueFilters = { status?: string; type?: string; caseId?: string };

/** The admin review queue: newest activity first, filtered on the server. */
export async function listDocumentQueue(filters: QueueFilters): Promise<QueueRow[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  let query = supabase.from("document_requests").select("*").order("updated_at", { ascending: false }).limit(500);
  if (filters.status) query = query.eq("status", filters.status as DocumentRequestRow["status"]);
  if (filters.type) query = query.eq("type_key", filters.type);
  if (filters.caseId) query = query.eq("case_id", filters.caseId);
  const [types, { data }, { data: cases }] = await Promise.all([documentTypes(supabase), query, supabase.from("student_cases").select("id, full_name")]);
  const names = new Map((cases ?? []).map((c) => [c.id, c.full_name]));
  return (data ?? []).map((r) => ({ ...r, type: types.get(r.type_key) ?? null, studentName: names.get(r.case_id) ?? "Student" }));
}

export type UploadStart = { ok: true; versionId: string; signedUrl: string } | { ok: false; message: string };

// Beyond the database's per-document and per-case daily limits: per person, across instances.
const uploadLimiter = createSharedRateLimiter({ name: "document-upload", limit: 30, windowMs: 60 * 60 * 1000 });

/**
 * Step 1 of an upload: the database checks the caller may upload to this
 * request and picks a quarantine path; the server signs a one-use upload URL
 * for exactly that path. The browser then PUTs the file straight to Storage.
 */
export async function startDocumentUpload(requestId: string, fileName: string): Promise<UploadStart> {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin) return { ok: false, message: "Document uploads aren't connected yet." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  if (!(await uploadLimiter(user.id)).allowed) return { ok: false, message: "Too many uploads in the last hour. Please try again later." };

  const { data, error } = await supabase.rpc("begin_document_upload", { p_request: requestId, p_filename: fileName });
  const row = data?.[0];
  if (error || !row) return { ok: false, message: error?.code === "54000" ? "Too many uploads today. Please try again tomorrow." : "This document can't receive a new file right now." };
  const signed = await admin.storage.from(DOCUMENT_BUCKET).createSignedUploadUrl(row.upload_path);
  if (signed.error || !signed.data) {
    console.error("[documents] could not sign upload", signed.error?.name);
    return { ok: false, message: "We couldn't prepare the upload. Please try again." };
  }
  return { ok: true, versionId: row.version_id, signedUrl: signed.data.signedUrl };
}

export type UploadResult = { ok: true } | { ok: false; message: string };

/**
 * Step 2: the server reads the quarantined object, checks it from its bytes
 * (size, real type), and writes those exact bytes itself to the final path with
 * the verified content type. The signed upload URL only ever pointed at
 * quarantine, so nothing the browser holds can replace a verified file.
 */
export async function finishDocumentUpload(versionId: string): Promise<UploadResult> {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin) return { ok: false, message: "Document uploads aren't connected yet." };

  // Read as the caller: RLS returns the pending version only to its own student or permitted staff.
  const { data: version } = await supabase.from("document_versions").select("id, upload_path, storage_path, state").eq("id", versionId).maybeSingle();
  if (!version || version.state !== "pending") return { ok: false, message: "We couldn't find that upload." };

  const bucket = admin.storage.from(DOCUMENT_BUCKET);
  const { data: blob, error } = await bucket.download(version.upload_path);
  if (error || !blob) return { ok: false, message: "The file didn't arrive. Please try the upload again." };
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await bucket.remove([version.upload_path]);

  const check = checkDocumentFile(bytes);
  const scan = check.ok ? await scanDocument(bytes) : null;
  if (!check.ok || scan?.status === "infected") {
    await admin.rpc("reject_document_file", { p_version: version.id });
    return { ok: false, message: check.ok ? "This file can't be accepted." : fileCheckMessages[check.reason] };
  }

  const stored = await bucket.upload(version.storage_path, bytes, { contentType: check.type, upsert: false });
  if (stored.error) {
    console.error("[documents] could not store verified file", stored.error.name);
    return { ok: false, message: "We couldn't store the file. Please upload it again." };
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const { error: completeError } = await admin.rpc("complete_document_upload", { p_version: version.id, p_mime: check.type, p_size: bytes.byteLength, p_sha256: sha256 });
  if (completeError) {
    await bucket.remove([version.storage_path]);
    return { ok: false, message: completeError.code === "22023" ? "This upload is no longer needed or has expired. Refresh and try again." : "We couldn't record the upload. Please try again." };
  }
  return { ok: true };
}

export type LinkResult = { ok: true; url: string } | { ok: false; message: string };

/** A five-minute link to one file version, after the database authorises and logs the access. The file name comes from the database. */
export async function documentLink(versionId: string, purpose: "download" | "preview"): Promise<LinkResult> {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin) return { ok: false, message: "Documents aren't connected yet." };
  const { data, error } = await supabase.rpc("authorize_document_download", { p_version: versionId, p_purpose: purpose });
  const file = data?.[0];
  if (error || !file) return { ok: false, message: "You don't have access to this file." };
  const signed = await admin.storage.from(DOCUMENT_BUCKET).createSignedUrl(file.storage_path, DOWNLOAD_LINK_SECONDS, purpose === "download" ? { download: file.download_name } : undefined);
  if (signed.error || !signed.data) return { ok: false, message: "We couldn't open the file. Please try again." };
  return { ok: true, url: signed.data.signedUrl };
}

/**
 * Daily: expire approved documents past their date; clear upload attempts whose
 * signed URL has expired (quarantine copies, and final copies of attempts never
 * completed); delete every file of cases closed over 12 months ago.
 */
export async function runDocumentRetention(): Promise<{ expired: number; cleaned: number; deleted: number } | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const bucket = admin.storage.from(DOCUMENT_BUCKET);
  const expired = await admin.rpc("expire_documents");

  let cleaned = 0;
  for (const row of (await admin.rpc("stale_document_uploads", { p_limit: 500 })).data ?? []) {
    const unverified = row.state === "pending" || row.state === "abandoned" || row.state === "rejected_file";
    const removed = await bucket.remove(unverified ? [row.upload_path, row.storage_path] : [row.upload_path]);
    if (removed.error) continue;
    if (!(await admin.rpc("mark_upload_cleaned", { p_version: row.version_id })).error) cleaned += 1;
  }

  let deleted = 0;
  for (const row of (await admin.rpc("documents_due_for_deletion", { p_limit: 200 })).data ?? []) {
    const removed = await bucket.remove([row.storage_path, row.upload_path]);
    if (removed.error) continue;
    if (!(await admin.rpc("mark_document_version_deleted", { p_version: row.version_id })).error) deleted += 1;
  }
  return { expired: expired.data ?? 0, cleaned, deleted };
}
