/** Renders schema.org JSON-LD. Empty data (e.g. only placeholders) renders nothing. */
export function JsonLd({ data }: { data: Record<string, unknown> | undefined }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here once "<" is escaped.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
