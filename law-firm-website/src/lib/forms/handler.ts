/**
 * Shared POST handler for the public forms. Each form route supplies its own
 * validation and message formatting; everything security-related lives here:
 *
 *   same-origin check → rate limit → content-type & size limits →
 *   CSRF/bot token → honeypot → validation & sanitisation → delivery
 */
import { NextResponse, type NextRequest } from "next/server";
import { FORM_TOKEN_COOKIE, FORM_TOKEN_HEADER, consumeFormToken, verifyFormToken } from "@/lib/security/form-token";
import { rateLimit } from "@/lib/security/rate-limit";
import { DeliveryNotConfiguredError, deliverSubmission, type Submission } from "./delivery";
import { HONEYPOT_FIELD, type FieldErrors, type ValidationResult } from "./validation";

const MAX_BODY_BYTES = 16 * 1024;

export interface FormResponseBody {
  ok: boolean;
  message: string;
  errors?: FieldErrors;
}

interface FormHandlerOptions<T> {
  name: Submission["kind"];
  validate: (input: Record<string, unknown>) => ValidationResult<T> | Promise<ValidationResult<T>>;
  toSubmission: (data: T) => Submission | Promise<Submission>;
  successMessage: string;
}

const NO_STORE = { "Cache-Control": "no-store" };

function respond(body: FormResponseBody, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Rejects cross-site requests: the Origin must match the host serving the site. */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const GENERIC_ERROR =
  "We could not send your message. Please try again shortly or contact us by phone or email.";

export function createFormHandler<T>({ name, validate, toSubmission, successMessage }: FormHandlerOptions<T>) {
  return async function POST(request: NextRequest) {
    if (!isSameOrigin(request)) {
      return respond({ ok: false, message: "This request could not be verified." }, 403);
    }

    const limit = rateLimit(`${name}:${clientIp(request)}`, { limit: 8, windowMs: 10 * 60 * 1000 });
    if (!limit.allowed) {
      return respond(
        { ok: false, message: "Too many submissions. Please wait a few minutes before trying again." },
        429,
        { "Retry-After": String(limit.retryAfterSeconds) },
      );
    }

    if (!request.headers.get("content-type")?.includes("application/json")) {
      return respond({ ok: false, message: "Unsupported request format." }, 415);
    }

    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
      return respond({ ok: false, message: "Your submission is too long." }, 413);
    }

    const headerToken = request.headers.get(FORM_TOKEN_HEADER);
    const token = verifyFormToken(headerToken, request.cookies.get(FORM_TOKEN_COOKIE)?.value);
    if (!token.valid) {
      const message =
        token.reason === "too-fast"
          ? "That was quick! Please take a moment to review your details and submit again."
          : "Your session has expired. Please submit the form again.";
      return respond({ ok: false, message }, 403);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return respond({ ok: false, message: "Unsupported request format." }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return respond({ ok: false, message: "Unsupported request format." }, 400);
    }
    const input = body as Record<string, unknown>;

    // Bots fill in every field. Pretend success so they learn nothing.
    if (typeof input[HONEYPOT_FIELD] === "string" && input[HONEYPOT_FIELD] !== "") {
      consumeFormToken(headerToken!);
      return respond({ ok: true, message: successMessage }, 200);
    }

    const result = await validate(input);
    if (!result.success) {
      return respond(
        { ok: false, message: "Please correct the highlighted fields.", errors: result.errors },
        422,
      );
    }

    try {
      await deliverSubmission(await toSubmission(result.data));
    } catch (error) {
      if (error instanceof DeliveryNotConfiguredError) {
        console.error(`[forms] ${name}: delivery is not configured. See .env.example.`);
      } else {
        console.error(`[forms] ${name}: delivery failed —`, error instanceof Error ? error.message : error);
      }
      return respond({ ok: false, message: GENERIC_ERROR }, 503);
    }

    consumeFormToken(headerToken!);
    return respond({ ok: true, message: successMessage }, 200);
  };
}
