/**
 * The founder's Cal.com booking page, from NEXT_PUBLIC_BOOKING_URL (for example
 * https://cal.com/asterpath/consultation). Cal.com adds the Google Meet link and
 * the calendar invite. Only plain https://cal.com links are accepted (no
 * credentials, no port); anything else counts as "not configured".
 */
export function bookingUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_BOOKING_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const plain = !url.username && !url.password && !url.port;
    return url.protocol === "https:" && url.hostname === "cal.com" && plain ? url : null;
  } catch {
    return null;
  }
}

/**
 * The booking page with the student's details filled in, so they only pick a
 * time. The enquiry reference travels as booking metadata, which lets the
 * Cal.com webhook attach the call to the right lead.
 */
export function bookingLinkFor(person: { name?: string; email?: string; reference?: string }): string | null {
  const url = bookingUrl();
  if (!url) return null;
  if (person.name) url.searchParams.set("name", person.name);
  if (person.email) url.searchParams.set("email", person.email);
  if (person.reference) {
    url.searchParams.set("notes", `Enquiry ${person.reference}`);
    url.searchParams.set("metadata[reference]", person.reference);
  }
  return url.toString();
}
