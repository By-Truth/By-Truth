import type { Metadata } from "next";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { LegalDocument } from "@/components/legal/LegalDocument";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description: `Terms of Use for the ${site.name} website.`,
  path: "/terms-of-use",
  // Keep the placeholder out of search results until the real terms are published.
  noIndex: true,
});

const pending = "[To be supplied by the firm.]";

export default function TermsOfUsePage() {
  return (
    <LegalDocument
      title="Terms of Use"
      path="/terms-of-use"
      intro={
        <p>
          [Placeholder] The firm&apos;s Terms of Use have not yet been provided. The headings below are a suggested
          structure only; the final wording should be prepared by the firm.
        </p>
      }
      sections={[
        { heading: "Use of this website", body: pending },
        { heading: "No legal advice", body: pending },
        { heading: "No lawyer–client relationship", body: pending },
        { heading: "Intellectual property", body: pending },
        { heading: "Third-party links", body: pending },
        { heading: "Limitation of liability", body: pending },
        { heading: "Governing law", body: pending },
        { heading: "Changes to these terms", body: pending },
      ]}
    />
  );
}
