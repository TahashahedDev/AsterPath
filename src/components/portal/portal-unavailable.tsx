import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/dashboard/ui";

/** Shown when demo fixtures are switched off and no real data source exists yet. */
export function PortalUnavailable({ what }: { what: string }) {
  return (
    <div className="mt-8">
      <EmptyState
        icon={Inbox}
        title={`Your ${what} will appear here`}
        description="This part of the portal connects to your case file once your account is set up. Nothing is shown until it holds your real information — we never fill it with estimates."
      />
    </div>
  );
}
