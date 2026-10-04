import type { Article } from "@/types/content";
import { ArrowLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArticleCard } from "@/components/insights/ArticleCard";

export function InsightsSection({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  const [lead, ...rest] = articles;

  return (
    <section aria-labelledby="insights-heading" className="border-t border-line bg-white py-24 sm:py-32">
      <Container size="wide">
        <div className="reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="insights-heading"
            eyebrow="Insights"
            title="Legal Insights"
            description="Commentary and updates on legal and regulatory developments affecting our clients."
          />
          <ArrowLink href="/insights">View All Insights</ArrowLink>
        </div>
        <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="reveal lg:col-span-7">
            <ArticleCard article={lead} />
          </div>
          {rest.length > 0 ? (
            <ul className="grid content-start gap-12 lg:col-span-5">
              {rest.slice(0, 2).map((article) => (
                <li key={article.slug} className="reveal border-t border-line pt-10 first:border-t-0 first:pt-0">
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
