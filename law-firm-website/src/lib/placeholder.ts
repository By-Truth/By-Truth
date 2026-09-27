/**
 * Placeholder detection.
 *
 * Content that has not yet been supplied by the firm is written in square
 * brackets, e.g. "[PHONE NUMBER]". These helpers let the UI avoid turning
 * placeholders into links and keep them out of structured data.
 */

const PLACEHOLDER_PATTERN = /\[[^\]]+\]/;

export function isPlaceholder(value: string | undefined | null): boolean {
  if (!value || value.trim() === "") return true;
  return PLACEHOLDER_PATTERN.test(value);
}

export function isProvided(value: string | undefined | null): value is string {
  return !isPlaceholder(value);
}

/**
 * Recursively removes placeholder strings, empty arrays and empty objects so
 * structured data only ever contains information the firm has supplied.
 */
export function stripPlaceholders<T>(input: T): T | undefined {
  if (typeof input === "string") {
    return (isPlaceholder(input) ? undefined : input) as T | undefined;
  }
  if (Array.isArray(input)) {
    const cleaned = input.map((item) => stripPlaceholders(item)).filter((item) => item !== undefined);
    return (cleaned.length > 0 ? cleaned : undefined) as T | undefined;
  }
  if (input && typeof input === "object") {
    const entries = Object.entries(input as Record<string, unknown>)
      .map(([key, value]) => [key, stripPlaceholders(value)] as const)
      .filter(([, value]) => value !== undefined);
    // An object holding only its schema.org @type carries no information.
    const meaningful = entries.filter(([key]) => key !== "@type" && key !== "@context");
    return (meaningful.length > 0 ? Object.fromEntries(entries) : undefined) as T | undefined;
  }
  return input;
}
