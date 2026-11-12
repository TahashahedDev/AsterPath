import { describe, expect, it, vi } from "vitest";
import { MAX_DOCUMENT_BYTES, checkDocumentFile, sniffDocumentType } from "@/features/documents/files";
import { reviewActions, studentCanUpload, studentNextStep } from "@/features/documents/status";

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (s: string) => new TextEncoder().encode(s);
// Synthetic files only: just enough bytes to carry each format's signature.
const pdf = text("%PDF-1.7\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\n");
const jpeg = bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46);
const png = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00);

describe("document file checks", () => {
  it("recognises PDF, JPEG and PNG from their bytes", () => {
    expect(sniffDocumentType(pdf)).toBe("application/pdf");
    expect(sniffDocumentType(jpeg)).toBe("image/jpeg");
    expect(sniffDocumentType(png)).toBe("image/png");
  });

  it("accepts a PDF header after a byte-order mark or whitespace, but refuses one hidden later in the file", () => {
    expect(sniffDocumentType(new Uint8Array([...text("\r\n  "), ...pdf]))).toBe("application/pdf");
    expect(sniffDocumentType(new Uint8Array([0xef, 0xbb, 0xbf, ...pdf]))).toBe("application/pdf");
    // An HTML page with a PDF marker further in (a "polyglot") is not a PDF here.
    expect(sniffDocumentType(new Uint8Array([...text("<html><body>"), ...pdf]))).toBeNull();
  });

  it("refuses other formats however they are named", () => {
    const windowsExe = bytes(0x4d, 0x5a, 0x90, 0x00); // "MZ"
    const zip = bytes(0x50, 0x4b, 0x03, 0x04); // also .docx
    const html = text("<!doctype html><script>alert(1)</script>");
    const svg = text('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    for (const file of [windowsExe, zip, html, svg]) expect(checkDocumentFile(file)).toEqual({ ok: false, reason: "unsupported-type" });
  });

  it("refuses empty and oversized files", () => {
    expect(checkDocumentFile(new Uint8Array())).toEqual({ ok: false, reason: "empty" });
    expect(checkDocumentFile(pdf, MAX_DOCUMENT_BYTES + 1)).toEqual({ ok: false, reason: "too-large" });
    expect(checkDocumentFile(pdf, MAX_DOCUMENT_BYTES)).toEqual({ ok: true, type: "application/pdf" });
  });
});

describe("document status helpers", () => {
  it("lets the student upload only when the document is waiting for them", () => {
    expect(["requested", "reupload_required", "expired"].every((s) => studentCanUpload(s as never))).toBe(true);
    expect(["uploaded", "under_review", "approved", "rejected", "withdrawn"].some((s) => studentCanUpload(s as never))).toBe(false);
  });

  it("offers decisions only once a file is under review, and replacements after a decision", () => {
    expect(reviewActions("uploaded")).toEqual([]);
    expect(reviewActions("under_review")).toEqual(["approved", "reupload_required", "rejected"]);
    expect(reviewActions("approved")).toEqual(["reupload_required"]);
    expect(reviewActions("withdrawn")).toEqual([]);
  });

  it("always tells the student their next step", () => {
    expect(studentNextStep("reupload_required")).toMatch(/feedback/);
    expect(studentNextStep("approved")).toBe("Nothing to do.");
  });
});

describe("document service without Supabase", () => {
  it("refuses uploads and links rather than pretending", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({ createSupabaseServerClient: async () => null }));
    vi.doMock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: () => null }));
    const svc = await import("@/server/services/documents");
    expect(await svc.startDocumentUpload("00000000-0000-4000-8000-000000000001", "a.pdf")).toEqual({ ok: false, message: expect.stringMatching(/aren't connected/) });
    expect(await svc.finishDocumentUpload("00000000-0000-4000-8000-000000000001")).toMatchObject({ ok: false });
    expect(await svc.documentLink("00000000-0000-4000-8000-000000000001", "download")).toMatchObject({ ok: false });
    expect(await svc.listCaseDocuments("00000000-0000-4000-8000-000000000001")).toBeNull();
    vi.doUnmock("@/lib/supabase/server");
    vi.doUnmock("@/lib/supabase/admin");
  });
});
