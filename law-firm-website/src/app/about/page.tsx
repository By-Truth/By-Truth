import Image from "next/image";
import type { Metadata } from "next";
import { aboutContent, principles, site } from "@/data/site";
import { images } from "@/data/images";
import { getAttorneys, getPracticeAreas } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { Principles } from "@/components/home/Principles";
import { TeamSection } from "@/components/home/TeamSection";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description: `Learn about ${site.name}, a Nigerian law firm providing professional legal services to individuals, businesses and institutions.`,
  path: "/about",
});

export default async function AboutPage() {
  const [attorneys, practiceAreas] = await Promise.all([getAttorneys(), getPracticeAreas()]);

  return (
    <>
      <PageHero
        eyebrow="About the Firm"
        title="Thoughtful Counsel. Principled Representation."
        description={site.description}
        breadcrumbs={[{ name: "About", href: "/about" }]}
        image={images.towersMonochrome}
      />

      <section aria-labelledby="overview-heading" className="py-24 sm:py-32">
        <Container size="wide" className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="reveal lg:col-span-5">
            <p className="eyebrow mb-6 text-gold-deep">Who We Are</p>
            <h2 id="overview-heading" className="display-2 text-navy">
              Built on Experience. Guided by Integrity.
            </h2>
          </div>
          <div className="reveal space-y-6 text-[1.0625rem] leading-[1.85] text-slate lg:col-span-6 lg:col-start-7">
            {aboutContent.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      <section aria-label="Mission and vision" className="pb-24 sm:pb-32">
        <Container size="wide" className="grid gap-px bg-line lg:grid-cols-12">
          <div className="reveal-image relative aspect-[4/3] lg:col-span-6 lg:aspect-auto">
            <Image src={images.conferenceRoom.src} alt={images.conferenceRoom.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="grid gap-px lg:col-span-6">
            {[
              { title: "Our Mission", text: aboutContent.mission },
              { title: "Our Vision", text: aboutContent.vision },
            ].map((item) => (
              <div key={item.title} className="reveal bg-white p-10 sm:p-14">
                <h2 className="font-serif text-3xl text-navy">{item.title}</h2>
                <p className="mt-5 text-[1.0625rem] leading-relaxed text-slate">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Principles principles={principles} />
      <TeamSection attorneys={attorneys} practiceAreas={practiceAreas} />
      <ConsultationCta />
    </>
  );
}
