"use client";

import { useState } from "react";
import { Download, Eye, Loader2 } from "lucide-react";
import type { LinkResult } from "@/server/services/documents";

/**
 * Opens one file version through a fresh five-minute signed link. Preview opens
 * in a new tab (the tab is opened on the click itself, so phones don't block
 * it); download stays on the page.
 */
export function OpenFileButton({ getLink, mode, label }: { getLink: () => Promise<LinkResult>; mode: "preview" | "download"; label: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setError(null);
    setPending(true);
    const tab = mode === "preview" ? window.open("about:blank", "_blank") : null;
    if (tab) tab.opener = null;
    const result = await getLink();
    setPending(false);
    if (!result.ok) {
      tab?.close();
      setError(result.message);
      return;
    }
    if (tab) tab.location.href = result.url;
    else window.location.assign(result.url);
  }

  const Icon = pending ? Loader2 : mode === "preview" ? Eye : Download;
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary ring-1 ring-border-strong hover:bg-ink/5 disabled:opacity-60"
      >
        <Icon className={pending ? "size-4 animate-spin" : "size-4"} aria-hidden="true" /> {label}
      </button>
      {error && <span role="alert" className="text-xs text-danger">{error}</span>}
    </span>
  );
}
