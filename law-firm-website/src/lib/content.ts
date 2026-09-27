/**
 * Content access layer.
 *
 * All pages read content through these functions rather than importing the
 * data files directly. To move to a CMS or database, re-implement these
 * functions (they are already async) and leave the UI untouched.
 */
import { articles } from "@/data/articles";
import { attorneys } from "@/data/attorneys";
import { practiceAreas } from "@/data/practiceAreas";
import type { Article, Attorney, PracticeArea } from "@/types/content";

function byNewest(a: Article, b: Article) {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/* Practice areas ---------------------------------------------------------- */

export async function getPracticeAreas(): Promise<PracticeArea[]> {
  return practiceAreas;
}

export async function getPracticeArea(slug: string): Promise<PracticeArea | undefined> {
  return practiceAreas.find((area) => area.slug === slug);
}

export async function getFeaturedPracticeArea(): Promise<PracticeArea | undefined> {
  return practiceAreas.find((area) => area.featured) ?? practiceAreas[0];
}

export async function getPracticeAreasBySlugs(slugs: string[]): Promise<PracticeArea[]> {
  return practiceAreas.filter((area) => slugs.includes(area.slug));
}

/* Attorneys --------------------------------------------------------------- */

export async function getAttorneys(): Promise<Attorney[]> {
  return attorneys;
}

export async function getAttorney(slug: string): Promise<Attorney | undefined> {
  return attorneys.find((attorney) => attorney.slug === slug);
}

export async function getAttorneysByPracticeArea(slug: string): Promise<Attorney[]> {
  return attorneys.filter((attorney) => attorney.practiceAreaSlugs.includes(slug));
}

/* Articles ---------------------------------------------------------------- */

export async function getArticles(): Promise<Article[]> {
  return [...articles].sort(byNewest);
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  return articles.find((article) => article.slug === slug);
}

export async function getArticlesByAuthor(authorSlug: string): Promise<Article[]> {
  return articles.filter((article) => article.authorSlug === authorSlug).sort(byNewest);
}

export async function getArticleCategories(): Promise<string[]> {
  return Array.from(new Set(articles.map((article) => article.category)));
}

/** Articles in the same category first, then the most recent others. */
export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const others = articles.filter((candidate) => candidate.slug !== article.slug).sort(byNewest);
  const sameCategory = others.filter((candidate) => candidate.category === article.category);
  const rest = others.filter((candidate) => candidate.category !== article.category);
  return [...sameCategory, ...rest].slice(0, limit);
}
