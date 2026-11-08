import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** Formats an integer rupee amount, e.g. 139000 → "₹1,39,000". */
export function formatInr(amount: number): string {
  return inr.format(amount);
}
