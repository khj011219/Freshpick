export type ExpirationStatus = "urgent" | "warning" | "safe" | "expired";

/** Returns the number of whole days from today to the expiry date (negative if past). */
export function getDaysRemaining(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Classifies an expiry date into one of four urgency levels. */
export function getExpirationStatus(expiryDate: string): ExpirationStatus {
  const days = getDaysRemaining(expiryDate);
  if (days < 0) return "expired";
  if (days <= 3) return "urgent";
  if (days <= 7) return "warning";
  return "safe";
}

/** Returns a human-readable D-day label: "D-3", "D-Day", "Expired". */
export function getDayLabel(expiryDate: string): string {
  const days = getDaysRemaining(expiryDate);
  if (days < 0) return "Expired";
  if (days === 0) return "D-Day";
  return `D-${days}`;
}
