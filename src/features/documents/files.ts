/**
 * What the document vault accepts, checked from the file's own bytes. The name
 * and the browser's declared type are hints only; a renamed .exe is refused
 * because its first bytes are not a PDF, JPEG or PNG signature.
 */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export type AcceptedDocumentType = (typeof ACCEPTED_DOCUMENT_TYPES)[number];
/** For <input accept>: a convenience for the picker, not a security check. */
export const DOCUMENT_ACCEPT_ATTRIBUTE = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) => signature.every((b, i) => bytes[offset + i] === b);

/** The real type from the first bytes, or null when it is none of the accepted ones. */
export function sniffDocumentType(bytes: Uint8Array): AcceptedDocumentType | null {
  // "%PDF-" at the start, after at most a byte-order mark and whitespace. Readers tolerate it
  // further in, but that is how HTML/ZIP polyglots pass as PDFs, so it is refused here.
  let i = startsWith(bytes, [0xef, 0xbb, 0xbf]) ? 3 : 0;
  while (i < 16 && (bytes[i] === 0x20 || bytes[i] === 0x09 || bytes[i] === 0x0a || bytes[i] === 0x0d)) i++;
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d], i)) return "application/pdf";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  return null;
}

export type FileCheck = { ok: true; type: AcceptedDocumentType } | { ok: false; reason: "empty" | "too-large" | "unsupported-type" };

/** Size and signature: run on the stored bytes by the server; the browser runs it too, for a quick answer. */
export function checkDocumentFile(bytes: Uint8Array, size = bytes.byteLength): FileCheck {
  if (size === 0) return { ok: false, reason: "empty" };
  if (size > MAX_DOCUMENT_BYTES) return { ok: false, reason: "too-large" };
  const type = sniffDocumentType(bytes);
  return type ? { ok: true, type } : { ok: false, reason: "unsupported-type" };
}

export const fileCheckMessages: Record<Exclude<FileCheck, { ok: true }>["reason"], string> = {
  empty: "That file is empty.",
  "too-large": "Files can be up to 10 MB. Try scanning at a lower resolution or splitting the PDF.",
  "unsupported-type": "Please upload a PDF, JPEG or PNG. Other formats, even if renamed, can't be accepted.",
};
