import type { Metadata } from "next";
import { principles, site } from "@/data/site";
import { getArticles, getAttorneys, getFeaturedPracticeArea, getPracticeAreas } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { FeaturedPracticeArea } from "@/components/home/FeaturedPracticeArea";
import { Hero } from "@/components/home/Hero";
import { InsightsSection } from "@/components/home/InsightsSection";
import { Introduction } from "@/components/home/Introduction";
import { PracticeAreasSection } from "@/components/home/PracticeAreasSection";
import { Principles } from "@/components/home/Principles";
import { TeamSection } from "@/components/home/TeamSection";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} | Trusted Legal Counsel in Nigeria`,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

export default async function HomePage() {
  const [practiceAreas, featured, attorneys, articles] = await Promise.all([
    getPracticeAreas(),
    getFeaturedPracticeArea(),
    getAttorneys(),
    getArticles(),
  ]);

  return (
    <>
      <Hero />
      <Introduction />
      <PracticeAreasSection areas={practiceAreas} />
      {featured ? <FeaturedPracticeArea area={featured} /> : null}
      <Principles principles={principles} />
      <TeamSection attorneys={attorneys} practiceAreas={practiceAreas} />
      <InsightsSection articles={articles.slice(0, 3)} />
      <ConsultationCta />
    </>
  );
}
