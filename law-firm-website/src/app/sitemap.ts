import type { MetadataRoute } from "next";
import { getArticles, getAttorneys, getPracticeAreas } from "@/lib/content";
import { isProvided } from "@/lib/placeholder";
import { absoluteUrl } from "@/lib/seo";

/**
 * Only pages intended for search engines are listed. Placeholder practice
 * areas / profiles and sample articles are `noindex`, so they are left out
 * until real content replaces them.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [areas, attorneys, articles] = await Promise.all([getPracticeAreas(), getAttorneys(), getArticles()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.8 },
    { url: absoluteUrl("/practice-areas"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/our-team"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/insights"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/consultation"), changeFrequency: "yearly", priority: 0.7 },
  ];

  const areaPages: MetadataRoute.Sitemap = areas
    .filter((area) => isProvided(area.name))
    .map((area) => ({ url: absoluteUrl(`/practice-areas/${area.slug}`), changeFrequency: "monthly", priority: 0.8 }));

  const attorneyPages: MetadataRoute.Sitemap = attorneys
    .filter((attorney) => isProvided(attorney.name))
    .map((attorney) => ({ url: absoluteUrl(`/our-team/${attorney.slug}`), changeFrequency: "monthly", priority: 0.6 }));

  const articlePages: MetadataRoute.Sitemap = articles
    .filter((article) => !article.isSample)
    .map((article) => ({
      url: absoluteUrl(`/insights/${article.slug}`),
      lastModified: article.updatedAt ?? article.publishedAt,
      changeFrequency: "yearly",
      priority: 0.6,
    }));

  return [...staticPages, ...areaPages, ...attorneyPages, ...articlePages];
}
