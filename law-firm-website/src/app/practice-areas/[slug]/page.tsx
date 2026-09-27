import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAttorneysByPracticeArea, getPracticeArea, getPracticeAreas } from "@/lib/content";
import { isPlaceholder } from "@/lib/placeholder";
import { buildMetadata } from "@/lib/seo";
import { serviceJsonLd } from "@/lib/structured-data";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { AttorneyCard } from "@/components/team/AttorneyCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";

export const dynamicParams = false;

export async function generateStaticParams() {
  const areas = await getPracticeAreas();
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: PageProps<"/practice-areas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const area = await getPracticeArea(slug);
  if (!area) return {};
  return buildMetadata({
    title: area.name,
    description: area.summary,
    path: `/practice-areas/${area.slug}`,
    image: area.image,
    noIndex: isPlaceholder(area.name),
  });
}

export default async function PracticeAreaPage({ params }: PageProps<"/practice-areas/[slug]">) {
  const { slug } = await params;
  const area = await getPracticeArea(slug);
  if (!area) notFound();

  const [allAreas, lawyers] = await Promise.all([getPracticeAreas(), getAttorneysByPracticeArea(area.slug)]);
  const otherAreas = allAreas.filter((other) => other.slug !== area.slug);

  return (
    <>
      <PageHero
        eyebrow="Practice Area"
        title={area.name}
        description={area.summary}
        image={area.image}
        breadcrumbs={[
          { name: "Practice Areas", href: "/practice-areas" },
          { name: area.name, href: `/practice-areas/${area.slug}` },
        ]}
      />

      <section className="py-20 sm:py-28">
        <Container size="wide" className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <h2 className="display-3 text-navy">Overview</h2>
            <div className="mt-8 space-y-6 text-[1.0625rem] leading-[1.85] text-slate">
              {area.overview.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {area.services.length > 0 ? (
              <div className="mt-16">
                <h2 className="display-3 text-navy">How We Can Help</h2>
                <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
                  {area.services.map((service, index) => (
                    <li key={`${service}-${index}`} className="flex items-start gap-4 bg-white p-6">
                      <Icon name="check" size={18} className="mt-1 shrink-0 text-gold-deep" />
                      <span className="text-charcoal/85">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
            <div className="bg-navy p-8 text-white sm:p-10 lg:sticky lg:top-32">
              <h2 className="font-serif text-2xl">Discuss your matter</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Request a consultation and a member of our team will contact you to arrange a convenient time.
              </p>
              <ButtonLink href="/consultation" className="mt-8 w-full">
                Book a Consultation
              </ButtonLink>
            </div>
            {otherAreas.length > 0 ? (
              <nav aria-labelledby="other-areas-heading">
                <h2 id="other-areas-heading" className="eyebrow mb-4 text-gold-deep">
                  Other Practice Areas
                </h2>
                <ul className="border-t border-line">
                  {otherAreas.map((other) => (
                    <li key={other.slug} className="border-b border-line">
                      <Link
                        href={`/practice-areas/${other.slug}`}
                        className="group flex items-center justify-between py-4 text-navy transition-colors hover:text-gold-deep"
                      >
                        <span className="font-serif text-xl">{other.name}</span>
                        <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </aside>
        </Container>
      </section>

      {lawyers.length > 0 ? (
        <section aria-labelledby="area-team-heading" className="border-t border-line bg-white py-20 sm:py-28">
          <Container size="wide">
            <h2 id="area-team-heading" className="display-3 text-navy">
              Lawyers in this Practice Area
            </h2>
            <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
              {lawyers.map((attorney) => (
                <li key={attorney.slug}>
                  <AttorneyCard attorney={attorney} practiceAreas={allAreas} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <ConsultationCta />
      <JsonLd data={serviceJsonLd(area)} />
    </>
  );
}
