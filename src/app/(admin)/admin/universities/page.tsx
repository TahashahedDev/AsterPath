import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { DataTable, PageHeader, StatusPill, formatDate, type Column } from "@/components/dashboard/ui";
import { regions } from "@/content/italy/regions";
import { CONTENT_CHECKED_ON, contentReview } from "@/content/italy/sources";
import { universities, universityKindLabel, type University } from "@/content/italy/universities";

export const metadata: Metadata = { title: "Universities" };

const regionName = new Map(regions.map((r) => [r.code, r.name]));

export default function UniversitiesPage() {
  const reviewed = contentReview.status === "reviewed";
  const columns: Column<University>[] = [
    { key: "name", header: "University", cell: (u) => u.name },
    { key: "region", header: "Region", cell: (u) => regionName.get(u.regionCode) ?? u.regionCode },
    { key: "city", header: "City", cell: (u) => u.city },
    { key: "kind", header: "Type", cell: (u) => universityKindLabel[u.kind], desktopOnly: true },
    {
      key: "url",
      header: "Official website",
      cell: (u) => (
        <a href={u.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 break-all text-primary underline-offset-4 hover:underline md:min-h-0">
          {u.url.replace(/^https?:\/\//, "")}
          <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ),
    },
    { key: "review", header: "Review", cell: () => <StatusPill tone={reviewed ? "success" : "gold"}>{reviewed ? "Reviewed" : "Researched"}</StatusPill> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Universities"
        description={`The ${universities.length} Italian state institutions published on the public site. This list is read from site content, not the database.`}
      />
      <p className="mt-6 text-sm text-muted">
        Official URLs last checked on {formatDate(CONTENT_CHECKED_ON)}.{" "}
        {reviewed ? `Reviewed by ${contentReview.reviewedBy}.` : "Awaiting sign-off by a named team member — public pages say so until then."} Programme catalogues and deadlines are linked, never restated.
      </p>
      <div className="mt-4">
        <DataTable rows={universities} columns={columns} rowKey={(u) => u.slug} primary="name" caption="Italian universities" />
      </div>
    </div>
  );
}
