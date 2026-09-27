import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle, getArticles, getAttorney, getRelatedArticles } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { articleJsonLd } from "@/lib/structured-data";
import { formatDate, readingTimeMinutes } from "@/lib/utils";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { ArticleBody, articlePlainText } from "@/components/insights/ArticleBody";
import { ArticleCard } from "@/components/insights/ArticleCard";
import { AttorneyPortrait } from "@/components/team/AttorneyPortrait";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  const author = await getAttorney(article.authorSlug);
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/insights/${article.slug}`,
    image: article.image,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt ?? article.publishedAt,
    authors: author ? [author.name] : undefined,
    noIndex: article.isSample,
  });
}

export default async function ArticlePage({ params }: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [author, related] = await Promise.all([getAttorney(article.authorSlug), getRelatedArticles(article)]);
  const minutes = readingTimeMinutes(articlePlainText(article.body));

  return (
    <>
      <article>
        <header className="bg-navy pt-36 pb-40 text-white sm:pt-44 sm:pb-48">
          <Container size="narrow">
            <div className="enter mb-10">
              <Breadcrumbs
                items={[
                  { name: "Insights", href: "/insights" },
                  { name: article.title, href: `/insights/${article.slug}` },
                ]}
              />
            </div>
            <p className="eyebrow enter mb-6 text-gold">{article.category}</p>
            <h1 className="enter enter-delay-1 font-serif text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">{article.title}</h1>
            <p className="lead enter enter-delay-2 mt-7 text-white/75">{article.excerpt}</p>
            <dl className="enter enter-delay-3 mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6 text-sm">
              {author ? (
                <div>
                  <dt className="text-[0.65rem] tracking-[0.2em] text-white/50 uppercase">Author</dt>
                  <dd className="mt-1">
                    <Link href={`/our-team/${author.slug}`} className="link-underline text-white">
                      {author.name}
                    </Link>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[0.65rem] tracking-[0.2em] text-white/50 uppercase">Published</dt>
                <dd className="mt-1 text-white">
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] tracking-[0.2em] text-white/50 uppercase">Reading time</dt>
                <dd className="mt-1 text-white">{minutes} min read</dd>
              </div>
            </dl>
          </Container>
        </header>

        <Container size="default" className="-mt-28 sm:-mt-32">
          <div className="relative mx-auto aspect-[16/9] max-w-5xl overflow-hidden bg-navy-800 shadow-2xl shadow-navy/20">
            <Image src={article.image.src} alt={article.image.alt} fill priority sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
          </div>
        </Container>

        <Container size="narrow" className="py-16 sm:py-24">
          <ArticleBody blocks={article.body} />

          <aside className="mt-16 border border-line bg-white p-6 text-sm leading-relaxed text-slate sm:p-8">
            <p>
              <strong className="font-semibold text-navy">Disclaimer:</strong> This article is provided for general
              information only and does not constitute legal advice. Specific advice should be sought on the facts of
              any particular matter.
            </p>
          </aside>

          {author ? (
            <aside aria-label="About the author" className="mt-12 flex flex-col gap-6 border-t border-line pt-12 sm:flex-row sm:items-center">
              <AttorneyPortrait attorney={author} sizes="112px" compact className="w-28 shrink-0" />
              <div>
                <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-gold-deep uppercase">Written by</p>
                <p className="mt-2 font-serif text-2xl text-navy">
                  <Link href={`/our-team/${author.slug}`} className="link-underline">
                    {author.name}
                  </Link>
                </p>
                <p className="mt-1 text-sm text-slate">{author.position}</p>
              </div>
            </aside>
          ) : null}
        </Container>
      </article>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="border-t border-line bg-white py-20 sm:py-28">
          <Container size="wide">
            <h2 id="related-heading" className="display-3 text-navy">
              Related Insights
            </h2>
            <ul className="mt-12 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <ArticleCard article={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <ConsultationCta title="Need advice on this issue?" />
      <JsonLd data={articleJsonLd(article, author)} />
    </>
  );
}
