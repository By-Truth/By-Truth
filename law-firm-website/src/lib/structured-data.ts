/**
 * schema.org structured data builders.
 *
 * Every builder passes its output through `stripPlaceholders`, so fields the
 * firm has not supplied yet are omitted rather than published as facts.
 */
import { site } from "@/data/site";
import type { Article, Attorney, PracticeArea } from "@/types/content";
import { isProvided, stripPlaceholders } from "./placeholder";
import { absoluteUrl } from "./seo";

type JsonLd = Record<string, unknown>;

const ORGANIZATION_ID = () => `${absoluteUrl("/")}#organization`;

export function legalServiceJsonLd(): JsonLd | undefined {
  return stripPlaceholders({
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": ORGANIZATION_ID(),
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: absoluteUrl("/"),
    telephone: site.phone,
    email: site.email,
    image: absoluteUrl("/images/hero-architecture.jpg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      addressCountry: "NG",
    },
    areaServed: { "@type": "Country", name: "Nigeria" },
    sameAs: site.social.map((link) => link.href).filter((href) => isProvided(href)),
  });
}

export function webSiteJsonLd(): JsonLd | undefined {
  return stripPlaceholders({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: absoluteUrl("/"),
    publisher: { "@id": ORGANIZATION_ID() },
  });
}

export function personJsonLd(attorney: Attorney, practiceAreas: PracticeArea[]): JsonLd | undefined {
  // Never describe a person whose name has not been supplied.
  if (!isProvided(attorney.name)) return undefined;
  return stripPlaceholders({
    "@context": "https://schema.org",
    "@type": "Person",
    name: attorney.name,
    jobTitle: attorney.position,
    url: absoluteUrl(`/our-team/${attorney.slug}`),
    email: attorney.email,
    image: attorney.portrait ? absoluteUrl(attorney.portrait.src) : undefined,
    worksFor: { "@id": ORGANIZATION_ID() },
    knowsAbout: practiceAreas.map((area) => area.name),
    description: attorney.shortBio,
  });
}

export function articleJsonLd(article: Article, author?: Attorney): JsonLd | undefined {
  if (!isProvided(article.title)) return undefined;
  return stripPlaceholders({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [absoluteUrl(article.image.src)],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    articleSection: article.category,
    mainEntityOfPage: absoluteUrl(`/insights/${article.slug}`),
    author:
      author && isProvided(author.name)
        ? { "@type": "Person", name: author.name, url: absoluteUrl(`/our-team/${author.slug}`) }
        : { "@id": ORGANIZATION_ID() },
    publisher: { "@id": ORGANIZATION_ID() },
  });
}

export function serviceJsonLd(area: PracticeArea): JsonLd | undefined {
  if (!isProvided(area.name)) return undefined;
  return stripPlaceholders({
    "@context": "https://schema.org",
    "@type": "Service",
    name: area.name,
    description: area.summary,
    url: absoluteUrl(`/practice-areas/${area.slug}`),
    provider: { "@id": ORGANIZATION_ID() },
    areaServed: { "@type": "Country", name: "Nigeria" },
  });
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      // Placeholder names fall back to the URL path so the trail stays valid.
      name: isProvided(item.name) ? item.name : item.href,
      item: absoluteUrl(item.href),
    })),
  };
}
