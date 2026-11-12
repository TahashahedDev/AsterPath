"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { beginUpload, completeUpload } from "@/app/(student)/portal/documents/actions";
import { DOCUMENT_ACCEPT_ATTRIBUTE, checkDocumentFile, fileCheckMessages } from "@/features/documents/files";
import { Button } from "@/components/ui/button";

type Phase = { kind: "idle" } | { kind: "uploading"; percent: number } | { kind: "checking" } | { kind: "done" } | { kind: "error"; message: string };

/** PUT straight to Storage through the one-use signed URL, reporting progress (fetch can't). */
function putWithProgress(url: string, file: File, contentType: string, onProgress: (percent: number) => void): Promise<boolean> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", contentType);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send(file);
  });
}

/**
 * Upload for one document request. The file is checked here for a quick answer
 * (size, real type from its first bytes), then again by the server from the
 * stored bytes, which is the check that counts.
 */
export function DocumentUpload({ requestId, label }: { requestId: string; label: string }) {
  const router = useRouter();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const busy = phase.kind === "uploading" || phase.kind === "checking";

  async function upload(file: File) {
    const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
    const local = checkDocumentFile(head, file.size);
    if (!local.ok) return setPhase({ kind: "error", message: fileCheckMessages[local.reason] });

    setPhase({ kind: "uploading", percent: 0 });
    const start = await beginUpload(requestId, file.name);
    if (!start.ok) return setPhase({ kind: "error", message: start.message });
    const sent = await putWithProgress(start.signedUrl, file, local.type, (percent) => setPhase({ kind: "uploading", percent }));
    if (!sent) return setPhase({ kind: "error", message: "The upload didn't finish. Check your connection and try again." });

    setPhase({ kind: "checking" });
    const done = await completeUpload(start.versionId);
    if (!done.ok) return setPhase({ kind: "error", message: done.message });
    setPhase({ kind: "done" });
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <input
        ref={input}
        id={inputId}
        type="file"
        accept={DOCUMENT_ACCEPT_ATTRIBUTE}
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void upload(file);
        }}
      />
      <Button type="button" size="md" disabled={busy} onClick={() => input.current?.click()} aria-describedby={`${inputId}-status`} className="w-full sm:w-auto">
        {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
        {busy ? "Uploading…" : label}
      </Button>
      <div id={`${inputId}-status`} aria-live="polite" className="text-sm">
        {phase.kind === "uploading" && (
          <div>
            <div role="progressbar" aria-label="Upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={phase.percent} className="h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${phase.percent}%` }} />
            </div>
            <p className="mt-1 text-muted">{phase.percent}% uploaded</p>
          </div>
        )}
        {phase.kind === "checking" && <p className="text-muted">Checking the file…</p>}
        {phase.kind === "done" && <p className="text-primary-deep">Uploaded. Your advisor will review it.</p>}
        {phase.kind === "error" && <p className="text-danger">{phase.message}</p>}
        {phase.kind === "idle" && <p className="text-muted">PDF, JPEG or PNG, up to 10 MB.</p>}
      </div>
    </div>
  );
}
