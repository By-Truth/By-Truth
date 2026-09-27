import type { Metadata } from "next";
import { site } from "@/data/site";
import { isProvided } from "./placeholder";

/**
 * Absolute site URL used for canonical links, Open Graph and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://www.example.com.ng).
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  if (isProvided(site.domain)) return `https://${site.domain.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export const DEFAULT_OG_IMAGE = "/og-image";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: { src: string; alt: string; width?: number; height?: number };
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
  /** Use the title as-is instead of applying the "| Firm Name" template. */
  absoluteTitle?: boolean;
}

/** Builds complete, page-specific metadata (canonical, Open Graph, X/Twitter). */
export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex,
  absoluteTitle,
}: PageMetadataInput): Metadata {
  const ogImage = image
    ? { url: image.src, alt: image.alt, width: image.width, height: image.height }
    : { url: DEFAULT_OG_IMAGE, alt: site.name, width: 1200, height: 630 };
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      title: fullTitle,
      description,
      siteName: site.name,
      locale: "en_NG",
      images: [ogImage],
      ...(type === "article" ? { publishedTime, modifiedTime, authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: ogImage.url, alt: ogImage.alt }],
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
