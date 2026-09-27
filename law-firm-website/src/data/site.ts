import type { NavItem, Principle, SiteConfig } from "@/types/content";

/**
 * Firm information.
 *
 * Every value in square brackets is a placeholder that must be replaced with
 * information supplied by the firm. Placeholder values are detected
 * automatically (see `src/lib/placeholder.ts`): they are never turned into
 * links, never emitted in structured data and never sent to search engines
 * as factual information.
 */
export const site: SiteConfig = {
  name: "[LAW FIRM NAME]",
  legalName: "[LAW FIRM NAME]",
  tagline: "[TAGLINE]",
  description:
    "[LAW FIRM NAME] provides professional legal services to individuals, businesses and institutions, delivering thoughtful counsel and strategic representation across Nigeria.",
  address: {
    street: "[FULL OFFICE ADDRESS]",
    city: "[CITY]",
    state: "[STATE]",
    country: "Nigeria",
  },
  phone: "[PHONE NUMBER]",
  email: "[EMAIL ADDRESS]",
  whatsapp: "[WHATSAPP NUMBER]",
  domain: "[DOMAIN]",
  businessHours: [
    { days: "Monday – Friday", hours: "[OPENING HOURS]" },
    { days: "Saturday", hours: "[OPENING HOURS]" },
    { days: "Sunday & Public Holidays", hours: "[OPENING HOURS]" },
  ],
  social: [
    { platform: "linkedin", label: "LinkedIn", href: "[LINKEDIN URL]" },
    { platform: "x", label: "X (Twitter)", href: "[X URL]" },
    { platform: "facebook", label: "Facebook", href: "[FACEBOOK URL]" },
    { platform: "instagram", label: "Instagram", href: "[INSTAGRAM URL]" },
  ],
  mapEmbedUrl: "",
};

export const mainNavigation: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Practice Areas", href: "/practice-areas" },
  { label: "Our Team", href: "/our-team" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

export const consultationCta: NavItem = {
  label: "Book a Consultation",
  href: "/consultation",
};

export const legalNavigation: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
];

/** Homepage introduction. Replace the placeholder paragraph with the firm's own words. */
export const firmIntroduction = {
  heading: ["Built on Experience.", "Guided by Integrity."],
  paragraphs: [
    `${site.name} provides professional legal services to individuals, businesses and institutions, delivering thoughtful counsel and strategic representation across Nigeria.`,
    "[A short introduction to the firm — its history, focus and approach. To be supplied by the firm.]",
  ],
};

/** About page content. */
export const aboutContent = {
  overview: [
    "[Firm overview — when and why the firm was established, the clients it serves and how it works. To be supplied by the firm.]",
    "[Additional paragraph about the firm's approach and areas of focus. To be supplied by the firm.]",
  ],
  mission: "[The firm's mission statement. To be supplied by the firm.]",
  vision: "[The firm's vision statement. To be supplied by the firm.]",
};

/**
 * "Why clients choose us" principles. These describe how the firm intends to
 * work — they are not claims about results, rankings or awards.
 */
export const principles: Principle[] = [
  {
    title: "Experience",
    description:
      "Counsel informed by practical knowledge of Nigerian law, its institutions and the commercial environment in which our clients operate.",
  },
  {
    title: "Integrity",
    description:
      "Candid advice, transparent engagement terms and strict adherence to the professional and ethical standards of legal practice.",
  },
  {
    title: "Client Focus",
    description:
      "We take time to understand each client's objectives, communicate clearly and keep clients informed at every stage of their matter.",
  },
  {
    title: "Strategic Thinking",
    description:
      "We look beyond the immediate issue to consider risk, cost and long-term consequences before recommending a course of action.",
  },
];
