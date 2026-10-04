import type { Article, ArticleBlock } from "@/types/content";
import { images } from "./images";

/**
 * Legal insights.
 *
 * The entries below are layout samples only (`isSample: true`), so they are
 * excluded from the sitemap and marked `noindex`. Replace them with the
 * firm's published articles and remove the `isSample` flag.
 *
 * Categories are taken from the articles themselves, so only categories the
 * firm actually writes about appear on the site.
 */

const sampleBody: ArticleBlock[] = [
  {
    type: "paragraph",
    text: "[Opening paragraph — introduce the legal development or issue and explain why it matters to readers.]",
  },
  { type: "heading", text: "[Section Heading]" },
  {
    type: "paragraph",
    text: "[Body paragraph explaining the background, the relevant law and its practical effect.]",
  },
  {
    type: "list",
    items: ["[Key point]", "[Key point]", "[Key point]"],
  },
  { type: "heading", text: "[Section Heading]" },
  {
    type: "paragraph",
    text: "[Body paragraph discussing implications for individuals, businesses or institutions.]",
  },
  { type: "quote", text: "[Optional pull quote or key takeaway.]" },
  { type: "subheading", text: "[Sub-section Heading]" },
  {
    type: "paragraph",
    text: "[Closing paragraph summarising the position and suggesting when readers should seek advice.]",
  },
];

export const articles: Article[] = [
  {
    slug: "sample-article-1",
    title: "[Article Title One]",
    excerpt: "[Short excerpt summarising the article in one or two sentences.]",
    category: "Commercial Law",
    publishedAt: "2026-09-01",
    authorSlug: "team-member-1",
    image: images.workspaceReview,
    body: sampleBody,
    isSample: true,
  },
  {
    slug: "sample-article-2",
    title: "[Article Title Two]",
    excerpt: "[Short excerpt summarising the article in one or two sentences.]",
    category: "Commercial Law",
    publishedAt: "2026-08-15",
    authorSlug: "team-member-2",
    image: images.officeDesk,
    body: sampleBody,
    isSample: true,
  },
  {
    slug: "sample-article-3",
    title: "[Article Title Three]",
    excerpt: "[Short excerpt summarising the article in one or two sentences.]",
    category: "Legal Consultation",
    publishedAt: "2026-08-01",
    authorSlug: "team-member-3",
    image: images.teamDiscussion,
    body: sampleBody,
    isSample: true,
  },
];
