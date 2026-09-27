import type { PracticeArea } from "@/types/content";
import { images } from "./images";

/**
 * Practice areas.
 *
 * Replace each placeholder with one of the firm's actual practice areas.
 * When a real name is supplied, update the `slug` to match it
 * (e.g. "corporate-commercial-law") — the slug becomes the page URL.
 * Exactly one entry should have `featured: true`.
 */
export const practiceAreas: PracticeArea[] = [
  {
    slug: "practice-area-1",
    name: "[Practice Area 1]",
    summary: "[Short description of this practice area — one or two sentences.]",
    overview: [
      "[Introduction to this practice area — the legal issues it covers and the clients it serves. To be supplied by the firm.]",
      "[How the firm approaches matters in this area. To be supplied by the firm.]",
    ],
    services: ["[Service or matter type]", "[Service or matter type]", "[Service or matter type]"],
    icon: "briefcase",
    image: images.documentSigning,
    featured: true,
  },
  {
    slug: "practice-area-2",
    name: "[Practice Area 2]",
    summary: "[Short description of this practice area — one or two sentences.]",
    overview: [
      "[Introduction to this practice area — the legal issues it covers and the clients it serves. To be supplied by the firm.]",
    ],
    services: ["[Service or matter type]", "[Service or matter type]", "[Service or matter type]"],
    icon: "document",
    image: images.workspaceReview,
  },
  {
    slug: "practice-area-3",
    name: "[Practice Area 3]",
    summary: "[Short description of this practice area — one or two sentences.]",
    overview: [
      "[Introduction to this practice area — the legal issues it covers and the clients it serves. To be supplied by the firm.]",
    ],
    services: ["[Service or matter type]", "[Service or matter type]", "[Service or matter type]"],
    icon: "building",
    image: images.glassFacade,
  },
  {
    slug: "practice-area-4",
    name: "[Practice Area 4]",
    summary: "[Short description of this practice area — one or two sentences.]",
    overview: [
      "[Introduction to this practice area — the legal issues it covers and the clients it serves. To be supplied by the firm.]",
    ],
    services: ["[Service or matter type]", "[Service or matter type]", "[Service or matter type]"],
    icon: "shield",
    image: images.conferenceRoom,
  },
  {
    slug: "practice-area-5",
    name: "[Practice Area 5]",
    summary: "[Short description of this practice area — one or two sentences.]",
    overview: [
      "[Introduction to this practice area — the legal issues it covers and the clients it serves. To be supplied by the firm.]",
    ],
    services: ["[Service or matter type]", "[Service or matter type]", "[Service or matter type]"],
    icon: "users",
    image: images.teamDiscussion,
  },
  {
    slug: "practice-area-6",
    name: "[Practice Area 6]",
    summary: "[Short description of this practice area — one or two sentences.]",
    overview: [
      "[Introduction to this practice area — the legal issues it covers and the clients it serves. To be supplied by the firm.]",
    ],
    services: ["[Service or matter type]", "[Service or matter type]", "[Service or matter type]"],
    icon: "globe",
    image: images.towersMonochrome,
  },
];
