import { isProvided } from "./placeholder";

/** Joins class names, ignoring falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Lagos",
});

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T12:00:00+01:00`));
}

export function readingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** `tel:` link for a supplied phone number, or undefined for a placeholder. */
export function telHref(phone: string): string | undefined {
  if (!isProvided(phone)) return undefined;
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function mailtoHref(email: string): string | undefined {
  return isProvided(email) ? `mailto:${email}` : undefined;
}

/** wa.me link for a supplied WhatsApp number, or undefined for a placeholder. */
export function whatsappHref(number: string, message?: string): string | undefined {
  if (!isProvided(number)) return undefined;
  const digits = number.replace(/\D/g, "");
  if (digits.length < 8) return undefined;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}
