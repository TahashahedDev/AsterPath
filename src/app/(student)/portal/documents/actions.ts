"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { documentLink, finishDocumentUpload, startDocumentUpload, type LinkResult, type UploadResult, type UploadStart } from "@/server/services/documents";

// Authorisation is in the database functions these call, as the signed-in student.
const id = z.uuid();
const fileName = z.string().trim().min(1).max(200);

export async function beginUpload(requestId: string, name: string): Promise<UploadStart> {
  const parsed = z.object({ requestId: id, name: fileName }).safeParse({ requestId, name });
  if (!parsed.success) return { ok: false, message: "That upload couldn't be started." };
  return startDocumentUpload(parsed.data.requestId, parsed.data.name);
}

export async function completeUpload(versionId: string): Promise<UploadResult> {
  if (!id.safeParse(versionId).success) return { ok: false, message: "That upload couldn't be found." };
  const result = await finishDocumentUpload(versionId);
  revalidatePath("/portal/documents");
  return result;
}

export async function downloadMyDocument(versionId: string): Promise<LinkResult> {
  if (!id.safeParse(versionId).success) return { ok: false, message: "That file couldn't be found." };
  return documentLink(versionId, "download");
}
