import type { Metadata } from "next";
import { site } from "@/data/site";
import { images } from "@/data/images";
import { getAttorneys, getPracticeAreas } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { AttorneyCard } from "@/components/team/AttorneyCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = buildMetadata({
  title: "Our Team",
  description: `Meet the lawyers of ${site.name}.`,
  path: "/our-team",
});

export default async function TeamPage() {
  const [attorneys, practiceAreas] = await Promise.all([getAttorneys(), getPracticeAreas()]);

  return (
    <>
      <PageHero
        eyebrow="Our People"
        title="Meet Our Legal Team"
        description="The lawyers who advise and represent our clients."
        breadcrumbs={[{ name: "Our Team", href: "/our-team" }]}
        image={images.teamDiscussion}
      />
      <section aria-label="Team members" className="py-20 sm:py-28">
        <Container size="wide">
          {attorneys.length > 0 ? (
            <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
              {attorneys.map((attorney) => (
                <li key={attorney.slug} className="reveal">
                  <AttorneyCard attorney={attorney} practiceAreas={practiceAreas} headingLevel="h2" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Team profiles coming soon" />
          )}
        </Container>
      </section>
      <ConsultationCta />
    </>
  );
}
