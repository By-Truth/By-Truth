/**
 * Delivers validated form submissions to the firm.
 *
 * Configure ONE of the following server-side environment variable sets
 * (never prefix them with NEXT_PUBLIC_):
 *
 *   Email via Resend (https://resend.com):
 *     RESEND_API_KEY, FORM_RECIPIENT_EMAIL, FORM_SENDER_EMAIL
 *
 *   Webhook (Zapier, Make, a CRM or your own endpoint):
 *     FORM_WEBHOOK_URL and optionally FORM_WEBHOOK_SECRET, used to sign the
 *     body with HMAC-SHA256 in the X-Signature header.
 *
 * In development, when nothing is configured, a redacted summary is logged
 * instead. In production an unconfigured site refuses submissions rather
 * than silently discarding them.
 */
import { createHmac } from "node:crypto";

export class DeliveryNotConfiguredError extends Error {
  constructor() {
    super("Form delivery is not configured.");
    this.name = "DeliveryNotConfiguredError";
  }
}

export interface Submission {
  kind: "consultation" | "contact";
  subject: string;
  replyTo: string;
  /** Ordered label → value pairs. Values are already validated and sanitised. */
  fields: Array<[label: string, value: string]>;
}

const TIMEOUT_MS = 10_000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toText(submission: Submission): string {
  return submission.fields.map(([label, value]) => `${label}:\n${value}`).join("\n\n");
}

function toHtml(submission: Submission): string {
  const rows = submission.fields
    .map(
      ([label, value]) =>
        `<tr><th align="left" valign="top" style="padding:8px 16px 8px 0;font-family:sans-serif;color:#555">${escapeHtml(label)}</th>` +
        `<td style="padding:8px 0;font-family:sans-serif;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  return `<h2 style="font-family:serif">${escapeHtml(submission.subject)}</h2><table>${rows}</table>`;
}

async function sendWithResend(submission: Submission, apiKey: string, to: string, from: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((address) => address.trim()),
      reply_to: submission.replyTo,
      subject: submission.subject,
      text: toText(submission),
      html: toHtml(submission),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Email provider responded with ${response.status}`);
}

async function sendToWebhook(submission: Submission, url: string, secret?: string) {
  const body = JSON.stringify({
    kind: submission.kind,
    subject: submission.subject,
    replyTo: submission.replyTo,
    submittedAt: new Date().toISOString(),
    fields: Object.fromEntries(submission.fields),
  });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) headers["X-Signature"] = createHmac("sha256", secret).update(body).digest("hex");

  const response = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Webhook responded with ${response.status}`);
}

export async function deliverSubmission(submission: Submission): Promise<void> {
  const { RESEND_API_KEY, FORM_RECIPIENT_EMAIL, FORM_SENDER_EMAIL, FORM_WEBHOOK_URL, FORM_WEBHOOK_SECRET } =
    process.env;

  if (RESEND_API_KEY && FORM_RECIPIENT_EMAIL && FORM_SENDER_EMAIL) {
    return sendWithResend(submission, RESEND_API_KEY, FORM_RECIPIENT_EMAIL, FORM_SENDER_EMAIL);
  }
  if (FORM_WEBHOOK_URL) {
    return sendToWebhook(submission, FORM_WEBHOOK_URL, FORM_WEBHOOK_SECRET);
  }
  if (process.env.NODE_ENV !== "production") {
    // Never log personal details — only which fields were received.
    console.info(
      `[forms] Delivery not configured; ${submission.kind} submission accepted in development mode ` +
        `(fields: ${submission.fields.map(([label]) => label).join(", ")}).`,
    );
    return;
  }
  throw new DeliveryNotConfiguredError();
}
