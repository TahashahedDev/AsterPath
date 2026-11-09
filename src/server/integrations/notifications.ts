import "server-only";

/**
 * Team notifications. No email provider is configured yet, so this records a
 * server log line containing only the reference — never personal details.
 * An email adapter replaces this once a provider is approved.
 */
export async function notifyTeamOfNewLead(lead: { reference: string; level: string }): Promise<void> {
  console.info(`[leads] New enquiry ${lead.reference} (${lead.level}). Team email not configured — check the lead store.`);
}
