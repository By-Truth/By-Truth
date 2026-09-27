import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalDocumentProps {
  title: string;
  path: string;
  intro: ReactNode;
  sections: LegalSection[];
}

/**
 * Layout for policy pages. The firm must supply the actual policy wording —
 * the section list only provides a structure to be completed.
 */
export function LegalDocument({ title, path, intro, sections }: LegalDocumentProps) {
  return (
    <>
      <PageHero title={title} breadcrumbs={[{ name: title, href: path }]} />
      <Container size="narrow" className="py-20 sm:py-28">
        <div className="border-l-2 border-gold bg-white px-6 py-5 text-sm leading-relaxed text-slate">{intro}</div>
        <div className="prose-article mt-12">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p className="mt-4">{section.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
