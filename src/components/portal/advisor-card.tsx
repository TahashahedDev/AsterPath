import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/dashboard/ui";
import { ExternalButtonLink } from "@/components/ui/button";
import type { StaffMember } from "@/features/operations/types";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function AdvisorCard({ advisor, studentFirstName, className, heading = "Your advisor" }: { advisor: StaffMember | null; studentFirstName: string; className?: string; heading?: string }) {
  const message = `Hello${advisor ? ` ${advisor.name}` : ""}, this is ${studentFirstName} from the AsterPath student portal. I have a question about my case.`;
  return (
    <section aria-labelledby="advisor-heading" className={cn("rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]", className)}>
      <h2 id="advisor-heading" className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">
        {heading}
      </h2>
      {advisor ? (
        <div className="mt-4 flex items-center gap-3">
          <Avatar initials={advisor.initials} className="size-12 text-sm" />
          <div className="min-w-0">
            <p className="display truncate text-xl text-ink">{advisor.name}</p>
            <p className="text-sm text-muted">{advisor.role} · responsible for your case</p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">An advisor is being assigned to your case. You&rsquo;ll see their name here.</p>
      )}
      <ExternalButtonLink href={whatsappUrl(message)} variant="primary" className="mt-5 w-full">
        <MessageCircle aria-hidden="true" />
        Message on WhatsApp
      </ExternalButtonLink>
    </section>
  );
}
