/**
 * Signed, single-use form tokens (CSRF + bot protection).
 *
 * GET /api/form-token issues a token and stores the same value in an
 * HttpOnly, SameSite=Strict cookie. A submission is only accepted when:
 *   1. the X-Form-Token header matches the cookie (double-submit),
 *   2. the HMAC signature is valid (token was issued by this server),
 *   3. the token is older than MIN_AGE (humans take time to fill a form)
 *      and younger than MAX_AGE,
 *   4. the token has not been used before.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const MIN_AGE_MS = 3_000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export const FORM_TOKEN_HEADER = "x-form-token";
export const FORM_TOKEN_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-form_token" : "form_token";
export const FORM_TOKEN_MAX_AGE_SECONDS = MAX_AGE_MS / 1000;

let fallbackSecret: string | undefined;

function getSecret(): string {
  const secret = process.env.FORM_TOKEN_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (!fallbackSecret) {
    fallbackSecret = randomBytes(32).toString("hex");
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[forms] FORM_TOKEN_SECRET is not set (or shorter than 32 characters). " +
          "Using a per-process secret; tokens will not survive restarts or work across instances.",
      );
    }
  }
  return fallbackSecret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function issueFormToken(now = Date.now()): string {
  const payload = `${now}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

/* Replay protection: remember recently used tokens until they expire. */
const usedTokens = new Map<string, number>();
const MAX_TRACKED_TOKENS = 5_000;

function pruneUsedTokens(now: number) {
  for (const [token, expiresAt] of usedTokens) {
    if (expiresAt <= now) usedTokens.delete(token);
  }
  // Hard cap so memory stays bounded under abuse.
  while (usedTokens.size > MAX_TRACKED_TOKENS) {
    const oldest = usedTokens.keys().next().value;
    if (oldest === undefined) break;
    usedTokens.delete(oldest);
  }
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export type TokenCheck = { valid: true } | { valid: false; reason: "missing" | "invalid" | "too-fast" | "expired" | "reused" };

export function verifyFormToken(
  headerToken: string | null,
  cookieToken: string | undefined,
  now = Date.now(),
): TokenCheck {
  if (!headerToken || !cookieToken) return { valid: false, reason: "missing" };
  if (headerToken.length > 200 || !safeEqual(headerToken, cookieToken)) return { valid: false, reason: "invalid" };

  const parts = headerToken.split(".");
  if (parts.length !== 3) return { valid: false, reason: "invalid" };
  const [issuedAtRaw, nonce, signature] = parts;
  if (!safeEqual(signature, sign(`${issuedAtRaw}.${nonce}`))) return { valid: false, reason: "invalid" };

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return { valid: false, reason: "invalid" };
  const age = now - issuedAt;
  if (age < MIN_AGE_MS) return { valid: false, reason: "too-fast" };
  if (age > MAX_AGE_MS) return { valid: false, reason: "expired" };

  pruneUsedTokens(now);
  if (usedTokens.has(headerToken)) return { valid: false, reason: "reused" };

  return { valid: true };
}

/**
 * Marks a verified token as spent. Called only after a successful submission
 * so a visitor can correct validation errors without requesting a new token.
 */
export function consumeFormToken(token: string, now = Date.now()) {
  const issuedAt = Number(token.split(".")[0]);
  usedTokens.set(token, (Number.isFinite(issuedAt) ? issuedAt : now) + MAX_AGE_MS);
}
