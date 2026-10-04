/**
 * Form validation shared by the browser and the API routes.
 *
 * The same rules run client-side (for immediate feedback) and server-side
 * (the source of truth — client validation can always be bypassed).
 * This module has no dependencies so it is safe to import anywhere.
 */

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: FieldErrors<Extract<keyof T, string>> };

export interface SelectOption {
  value: string;
  label: string;
}

/* Sanitisation ------------------------------------------------------------ */

// Control characters except tab / newline / carriage return.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Normalises user input: unicode NFC, strips control characters, trims. */
export function sanitizeText(value: unknown, { multiline = false } = {}): string {
  if (typeof value !== "string") return "";
  let text = value.normalize("NFC").replace(CONTROL_CHARS, "");
  text = multiline
    ? text.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n")
    : text.replace(/\s+/g, " ");
  return text.trim();
}

/* Rules ------------------------------------------------------------------- */

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9\s\-().]{7,20}$/;
const NAME_PATTERN = /^[\p{L}\p{M}'’.\-\s]+$/u;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /(https?:\/\/|www\.)/gi;

export const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  phone: { min: 7, max: 20 },
  subject: { min: 3, max: 150 },
  description: { min: 20, max: 2000 },
  message: { min: 10, max: 3000 },
} as const;

function checkName(value: string): string | undefined {
  if (!value) return "Please enter your full name.";
  if (value.length < LIMITS.name.min) return "Please enter your full name.";
  if (value.length > LIMITS.name.max) return `Name must be ${LIMITS.name.max} characters or fewer.`;
  if (!NAME_PATTERN.test(value)) return "Name may only contain letters, spaces, hyphens and apostrophes.";
}

function checkEmail(value: string): string | undefined {
  if (!value) return "Please enter your email address.";
  if (value.length > LIMITS.email.max || !EMAIL_PATTERN.test(value)) {
    return "Please enter a valid email address.";
  }
}

function checkPhone(value: string, required: boolean): string | undefined {
  if (!value) return required ? "Please enter your phone number." : undefined;
  const digits = value.replace(/\D/g, "");
  if (!PHONE_PATTERN.test(value) || digits.length < 7 || digits.length > 15) {
    return "Please enter a valid phone number, e.g. +234 800 000 0000.";
  }
}

function checkLength(value: string, label: string, min: number, max: number): string | undefined {
  if (!value) return `Please enter ${label}.`;
  if (value.length < min) return `Please provide at least ${min} characters.`;
  if (value.length > max) return `Please keep this to ${max} characters or fewer.`;
}

/** Rejects free-text that looks like link spam. */
function checkLinks(value: string): string | undefined {
  const matches = value.match(URL_PATTERN);
  if (matches && matches.length > 2) return "Please remove web links from your message.";
}

/** Today's date in Lagos as YYYY-MM-DD. */
export function todayInLagos(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function checkPreferredDate(value: string): string | undefined {
  if (!value) return "Please choose a preferred date.";
  if (!DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) return "Please choose a valid date.";
  const today = todayInLagos();
  if (value < today) return "Please choose a date from today onwards.";
  const limit = new Date(`${today}T00:00:00Z`);
  limit.setUTCFullYear(limit.getUTCFullYear() + 1);
  if (value > limit.toISOString().slice(0, 10)) return "Please choose a date within the next 12 months.";
}

function checkConsent(value: unknown): string | undefined {
  if (value !== true && value !== "true" && value !== "on") {
    return "Please confirm you have read the notice above.";
  }
}

/* Consultation request ---------------------------------------------------- */

export const CONSULTATION_METHODS: SelectOption[] = [
  { value: "in-person", label: "In person at our office" },
  { value: "phone", label: "Phone call" },
  { value: "video", label: "Video call" },
];

export const GENERAL_MATTER_OPTIONS: SelectOption[] = [
  { value: "other", label: "Other / not sure" },
];

export interface ConsultationRequest {
  fullName: string;
  email: string;
  phone: string;
  practiceArea: string;
  preferredDate: string;
  consultationMethod: string;
  description: string;
  consent: boolean;
}

export type ConsultationField = keyof ConsultationRequest;

export function validateConsultation(
  input: Record<string, unknown>,
  practiceAreaValues: string[],
): ValidationResult<ConsultationRequest> {
  const data: ConsultationRequest = {
    fullName: sanitizeText(input.fullName),
    email: sanitizeText(input.email).toLowerCase(),
    phone: sanitizeText(input.phone),
    practiceArea: sanitizeText(input.practiceArea),
    preferredDate: sanitizeText(input.preferredDate),
    consultationMethod: sanitizeText(input.consultationMethod),
    description: sanitizeText(input.description, { multiline: true }),
    consent: input.consent === true || input.consent === "true" || input.consent === "on",
  };

  const allowedMatters = [...practiceAreaValues, ...GENERAL_MATTER_OPTIONS.map((o) => o.value)];
  const errors: FieldErrors<ConsultationField> = {
    fullName: checkName(data.fullName),
    email: checkEmail(data.email),
    phone: checkPhone(data.phone, true),
    practiceArea: allowedMatters.includes(data.practiceArea)
      ? undefined
      : "Please select the area your matter relates to.",
    preferredDate: checkPreferredDate(data.preferredDate),
    consultationMethod: CONSULTATION_METHODS.some((m) => m.value === data.consultationMethod)
      ? undefined
      : "Please select how you would like to meet.",
    description:
      checkLength(data.description, "a brief description", LIMITS.description.min, LIMITS.description.max) ??
      checkLinks(data.description),
    consent: checkConsent(input.consent),
  };

  return finalize(data, errors);
}

/* Contact enquiry --------------------------------------------------------- */

export interface ContactEnquiry {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
}

export type ContactField = keyof ContactEnquiry;

export function validateContact(input: Record<string, unknown>): ValidationResult<ContactEnquiry> {
  const data: ContactEnquiry = {
    name: sanitizeText(input.name),
    email: sanitizeText(input.email).toLowerCase(),
    phone: sanitizeText(input.phone),
    subject: sanitizeText(input.subject),
    message: sanitizeText(input.message, { multiline: true }),
    consent: input.consent === true || input.consent === "true" || input.consent === "on",
  };

  const errors: FieldErrors<ContactField> = {
    name: checkName(data.name),
    email: checkEmail(data.email),
    phone: checkPhone(data.phone, false),
    subject: checkLength(data.subject, "a subject", LIMITS.subject.min, LIMITS.subject.max),
    message:
      checkLength(data.message, "your message", LIMITS.message.min, LIMITS.message.max) ??
      checkLinks(data.message),
    consent: checkConsent(input.consent),
  };

  return finalize(data, errors);
}

/* Helpers ----------------------------------------------------------------- */

function finalize<T>(data: T, errors: FieldErrors<Extract<keyof T, string>>): ValidationResult<T> {
  const present = Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  ) as FieldErrors<Extract<keyof T, string>>;
  return Object.keys(present).length > 0 ? { success: false, errors: present } : { success: true, data };
}

/** Name of the hidden honeypot field. Real visitors never fill it in. */
export const HONEYPOT_FIELD = "website";
