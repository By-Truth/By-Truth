import type { Metadata } from "next";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { LegalDocument } from "@/components/legal/LegalDocument";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `Privacy Policy of ${site.name}.`,
  path: "/privacy-policy",
  // Keep the placeholder out of search results until the real policy is published.
  noIndex: true,
});

const pending = "[To be supplied by the firm.]";

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      path="/privacy-policy"
      intro={
        <p>
          [Placeholder] The firm&apos;s Privacy Policy has not yet been provided. The headings below are a suggested
          structure only; the final wording should be prepared by the firm, having regard to the Nigeria Data
          Protection Act 2023 and any other applicable requirements.
        </p>
      }
      sections={[
        { heading: "Who we are", body: pending },
        { heading: "Information we collect", body: pending },
        { heading: "How we use your information", body: pending },
        { heading: "Lawful basis for processing", body: pending },
        { heading: "How long we keep information", body: pending },
        { heading: "Sharing and international transfers", body: pending },
        { heading: "Your rights", body: pending },
        { heading: "Cookies", body: pending },
        { heading: "Contact us", body: pending },
      ]}
    />
  );
}
