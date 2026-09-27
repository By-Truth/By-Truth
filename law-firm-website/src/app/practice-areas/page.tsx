import type { Metadata } from "next";
import { site } from "@/data/site";
import { images } from "@/data/images";
import { getPracticeAreas } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { PracticeAreaCard } from "@/components/practice/PracticeAreaCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = buildMetadata({
  title: "Practice Areas",
  description: `Explore the practice areas of ${site.name} — focused legal expertise for individuals, businesses and institutions in Nigeria.`,
  path: "/practice-areas",
});

export default async function PracticeAreasPage() {
  const areas = await getPracticeAreas();

  return (
    <>
      <PageHero
        eyebrow="Expertise"
        title="Our Practice Areas"
        description="Focused legal expertise designed to help our clients navigate complex legal and commercial matters."
        breadcrumbs={[{ name: "Practice Areas", href: "/practice-areas" }]}
        image={images.documentSigning}
      />
      <section aria-label="All practice areas" className="bg-ivory-200 py-20 sm:py-28">
        <Container size="wide">
          {areas.length > 0 ? (
            <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {areas.map((area, index) => (
                <li key={area.slug}>
                  <PracticeAreaCard area={area} index={index} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Practice areas coming soon">
              Please contact us to discuss how we can assist with your matter.
            </EmptyState>
          )}
        </Container>
      </section>
      <ConsultationCta />
    </>
  );
}
