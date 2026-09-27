/**
 * Content types shared by the local data files and the UI.
 *
 * These shapes are deliberately CMS-agnostic: when the firm adopts a CMS or
 * database, map its records onto these types inside `src/lib/content.ts`
 * and the components will keep working unchanged.
 */

export type IconName =
  | "briefcase"
  | "building"
  | "document"
  | "shield"
  | "globe"
  | "users"
  | "key"
  | "chart"
  | "compass"
  | "scale-line";

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface SocialLink {
  platform: "linkedin" | "x" | "facebook" | "instagram";
  label: string;
  href: string;
}

export interface BusinessHours {
  days: string;
  hours: string;
}

export interface SiteConfig {
  name: string;
  legalName: string;
  tagline: string;
  /** Used as the default meta description and in the footer. */
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  phone: string;
  email: string;
  /** International format without spaces, e.g. 2348012345678. */
  whatsapp: string;
  /** Bare domain, e.g. example.com.ng */
  domain: string;
  businessHours: BusinessHours[];
  social: SocialLink[];
  /**
   * Optional Google Maps embed URL (Share → Embed a map → copy the `src`).
   * Leave empty to show the address card without a map.
   */
  mapEmbedUrl: string;
  /** Optional path to a logo in /public. The text wordmark is used otherwise. */
  logo?: ImageAsset;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Principle {
  title: string;
  description: string;
}

export interface PracticeArea {
  slug: string;
  name: string;
  /** One or two sentences used on cards. */
  summary: string;
  /** Longer introduction paragraphs for the detail page. */
  overview: string[];
  /** Specific services or matters handled within this practice area. */
  services: string[];
  icon: IconName;
  image: ImageAsset;
  /** The featured practice area is highlighted on the homepage. */
  featured?: boolean;
}

export interface Attorney {
  slug: string;
  name: string;
  position: string;
  practiceAreaSlugs: string[];
  shortBio: string;
  biography: string[];
  education: string[];
  qualifications: string[];
  memberships: string[];
  /** Only shown when provided. */
  publications: string[];
  email?: string;
  /** Leave undefined until a real portrait is supplied. */
  portrait?: ImageAsset;
}

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO 8601 date, e.g. 2026-01-31 */
  publishedAt: string;
  updatedAt?: string;
  authorSlug: string;
  image: ImageAsset;
  body: ArticleBlock[];
  /**
   * Sample/placeholder content. Sample articles render normally but are
   * excluded from the sitemap and marked `noindex` so they never reach
   * search engines. Remove the flag once real content is in place.
   */
  isSample?: boolean;
}
