import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import { getArticlesByAuthor, getAttorney, getAttorneys, getPracticeAreasBySlugs } from "@/lib/content";
import { isPlaceholder, isProvided } from "@/lib/placeholder";
import { buildMetadata } from "@/lib/seo";
import { personJsonLd } from "@/lib/structured-data";
import { mailtoHref } from "@/lib/utils";
import { ArticleCard } from "@/components/insights/ArticleCard";
import { AttorneyPortrait } from "@/components/team/AttorneyPortrait";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";

export const dynamicParams = false;

export async function generateStaticParams() {
  const attorneys = await getAttorneys();
  return attorneys.map((attorney) => ({ slug: attorney.slug }));
}

export async function generateMetadata({ params }: PageProps<"/our-team/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const attorney = await getAttorney(slug);
  if (!attorney) return {};
  return buildMetadata({
    title: `${attorney.name}, ${attorney.position}`,
    description: isProvided(attorney.shortBio)
      ? attorney.shortBio
      : `Profile of ${attorney.name}, ${attorney.position} at ${site.name}.`,
    path: `/our-team/${attorney.slug}`,
    image: attorney.portrait,
    type: "profile",
    noIndex: isPlaceholder(attorney.name),
  });
}

function ProfileSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="border-t border-line py-10">
      <h2 className="eyebrow mb-6 text-gold-deep">{title}</h2>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-4 text-charcoal/85">
            <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0 bg-gold" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function AttorneyPage({ params }: PageProps<"/our-team/[slug]">) {
  const { slug } = await params;
  const attorney = await getAttorney(slug);
  if (!attorney) notFound();

  const [areas, articles] = await Promise.all([
    getPracticeAreasBySlugs(attorney.practiceAreaSlugs),
    getArticlesByAuthor(attorney.slug),
  ]);
  const email = attorney.email ? mailtoHref(attorney.email) : undefined;

  return (
    <>
      <section className="bg-navy pt-36 text-white sm:pt-44">
        <Container size="wide">
          <div className="enter mb-12">
            <Breadcrumbs
              items={[
                { name: "Our Team", href: "/our-team" },
                { name: attorney.name, href: `/our-team/${attorney.slug}` },
              ]}
            />
          </div>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="enter relative z-10 -mb-24 max-w-md lg:col-span-5 lg:-mb-40 lg:max-w-none">
              <AttorneyPortrait attorney={attorney} sizes="(min-width: 1024px) 40vw, 100vw" priority className="shadow-2xl shadow-navy/40" />
            </div>
            <div className="enter enter-delay-1 order-first lg:order-last lg:col-span-7 lg:pt-10 lg:pb-24">
              <p className="eyebrow mb-5 text-gold">{attorney.position}</p>
              <h1 className="display-1">{attorney.name}</h1>
              {areas.length > 0 ? (
                <ul className="mt-8 flex flex-wrap gap-2">
                  {areas.map((area) => (
                    <li key={area.slug}>
                      <Link
                        href={`/practice-areas/${area.slug}`}
                        className="inline-block border border-white/20 px-4 py-2 text-xs tracking-wide text-white/80 transition-colors hover:border-gold hover:text-gold-light"
                      >
                        {area.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <section className="pt-36 pb-20 sm:pb-28 lg:pt-20">
        <Container size="wide" className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <aside className="order-last lg:order-first lg:col-span-5 lg:pt-28">
            <div className="border border-line bg-white p-8 sm:p-10 lg:sticky lg:top-32">
              <h2 className="font-serif text-2xl text-navy">Speak with our team</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Request a consultation to discuss your matter. We will be in touch to confirm a suitable time.
              </p>
              <ButtonLink href="/consultation" variant="navy" className="mt-7 w-full">
                Book a Consultation
              </ButtonLink>
              {email ? (
                <a href={email} className="mt-5 flex items-center justify-center gap-2 text-sm text-navy hover:text-gold-deep">
                  <Icon name="mail" size={16} />
                  <span className="link-underline">{attorney.email}</span>
                </a>
              ) : attorney.email ? (
                <p className="mt-5 flex items-center justify-center gap-2 text-sm text-slate">
                  <Icon name="mail" size={16} />
                  {attorney.email}
                </p>
              ) : null}
            </div>
          </aside>

          <div className="lg:col-span-7">
            <section className="pb-10">
              <h2 className="eyebrow mb-6 text-gold-deep">Biography</h2>
              <div className="space-y-6 text-[1.0625rem] leading-[1.85] text-charcoal/85">
                {attorney.biography.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
            <ProfileSection title="Practice Areas" items={areas.map((area) => area.name)} />
            <ProfileSection title="Education" items={attorney.education} />
            <ProfileSection title="Professional Qualifications" items={attorney.qualifications} />
            <ProfileSection title="Professional Memberships" items={attorney.memberships} />
            <ProfileSection title="Publications & Notable Work" items={attorney.publications} />
          </div>
        </Container>
      </section>

      {articles.length > 0 ? (
        <section aria-labelledby="author-articles" className="border-t border-line bg-white py-20 sm:py-28">
          <Container size="wide">
            <h2 id="author-articles" className="display-3 text-navy">
              Insights by {attorney.name}
            </h2>
            <ul className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <li key={article.slug}>
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <JsonLd data={personJsonLd(attorney, areas)} />
    </>
  );
}
