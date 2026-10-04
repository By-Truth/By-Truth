import type { PracticeArea } from "@/types/content";
import { images } from "./images";

/**
 * Practice areas.
 *
 * The firm practises commercial law and legal consultation. The `services`
 * lists below describe matters typically handled within each area — confirm
 * them with the firm and remove anything it does not offer.
 *
 * The `slug` becomes the page URL. Exactly one entry should have
 * `featured: true`. To add a practice area, append another entry.
 */
export const practiceAreas: PracticeArea[] = [
  {
    slug: "commercial-law",
    name: "Commercial Law",
    summary:
      "Strategic legal advice for businesses, transactions, corporate governance and commercial relationships.",
    overview: [
      "Our commercial law practice supports individuals, businesses and institutions in structuring, documenting and protecting their commercial interests in Nigeria.",
      "We advise on the legal aspects of day-to-day business operations as well as significant transactions, with attention to commercial objectives, risk and regulatory requirements.",
      "[Additional detail about the firm's commercial practice — sectors served and approach. To be supplied by the firm.]",
    ],
    services: [
      "Drafting, review and negotiation of commercial contracts",
      "Business formation and registration with the Corporate Affairs Commission",
      "Corporate governance and company secretarial matters",
      "Commercial transactions and joint ventures",
      "Regulatory compliance for businesses",
      "Resolution of commercial disputes",
    ],
    icon: "briefcase",
    image: images.documentSigning,
    featured: true,
  },
  {
    slug: "legal-consultation",
    name: "Legal Consultation & Advisory",
    summary:
      "Clear, practical legal advice to help clients understand their position and make informed decisions.",
    overview: [
      "Our consultation service gives individuals, businesses and institutions access to considered legal advice on the issues they face — before decisions are made and before problems escalate.",
      "We take time to understand each matter, explain the relevant legal position in plain terms and set out the practical options available.",
      "[Additional detail about how consultations are arranged and conducted. To be supplied by the firm.]",
    ],
    services: [
      "Legal opinions on specific questions of law",
      "Review of documents before signing",
      "Advice on rights, obligations and available options",
      "Legal risk assessment for decisions and projects",
      "Ongoing advisory support for businesses",
      "Consultations in person, by phone or by video",
    ],
    icon: "compass",
    image: images.conferenceRoom,
  },
];
