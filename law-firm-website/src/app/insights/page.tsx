import type { Metadata } from "next";
import { site } from "@/data/site";
import { getArticles } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { ConsultationCta } from "@/components/home/ConsultationCta";
import { ArticleCard } from "@/components/insights/ArticleCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = buildMetadata({
  title: "Legal Insights",
  description: `Legal insights, commentary and regulatory updates from ${site.name}.`,
  path: "/insights",
});

export default async function InsightsPage() {
  const articles = await getArticles();
  const [lead, ...rest] = articles;

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Legal Insights"
        description="Commentary and updates on legal and regulatory developments affecting individuals, businesses and institutions in Nigeria."
        breadcrumbs={[{ name: "Insights", href: "/insights" }]}
      />
      <section aria-label="Articles" className="py-20 sm:py-28">
        <Container size="wide">
          {lead ? (
            <>
              <ArticleCard article={lead} variant="feature" headingLevel="h2" priority />
              {rest.length > 0 ? (
                <ul className="mt-20 grid gap-x-10 gap-y-16 border-t border-line pt-20 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <li key={article.slug} className="reveal">
                      <ArticleCard article={article} headingLevel="h2" />
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <EmptyState title="No articles published yet">
              New legal insights will appear here. In the meantime, please contact us with any questions.
            </EmptyState>
          )}
        </Container>
      </section>
      <ConsultationCta />
    </>
  );
}
