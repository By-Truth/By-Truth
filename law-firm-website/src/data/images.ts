import type { ImageAsset } from "@/types/content";

/**
 * Photography library. Images live in /public/images and are served through
 * next/image for responsive sizing and modern formats.
 *
 * Current photographs are licensed stock photography from Unsplash
 * (https://unsplash.com/license). Replace them with the firm's own
 * photography — office, building or team — when available.
 */
export const images = {
  heroArchitecture: {
    src: "/images/hero-architecture.jpg",
    alt: "Glass office towers rising against the sky",
    width: 2400,
    height: 1600,
  },
  boardroom: {
    src: "/images/boardroom.jpg",
    alt: "A quiet boardroom with a long table and city views",
    width: 1800,
    height: 1200,
  },
  documentSigning: {
    src: "/images/document-signing.jpg",
    alt: "A professional reviewing and signing a document",
    width: 1800,
    height: 1201,
  },
  conferenceRoom: {
    src: "/images/conference-room.jpg",
    alt: "A bright conference room with floor-to-ceiling windows",
    width: 1800,
    height: 1200,
  },
  glassFacade: {
    src: "/images/glass-facade.jpg",
    alt: "The glass facade of a modern office building",
    width: 2000,
    height: 3000,
  },
  towersMonochrome: {
    src: "/images/towers-monochrome.jpg",
    alt: "Office towers seen from street level in muted tones",
    width: 2000,
    height: 1333,
  },
  workspaceReview: {
    src: "/images/workspace-review.jpg",
    alt: "Two colleagues reviewing notes beside a laptop",
    width: 1600,
    height: 1068,
  },
  teamDiscussion: {
    src: "/images/team-discussion.jpg",
    alt: "Colleagues taking notes around a meeting table",
    width: 1600,
    height: 1067,
  },
  officeDesk: {
    src: "/images/office-desk.jpg",
    alt: "A tidy office desk overlooking the city",
    width: 1600,
    height: 1067,
  },
} satisfies Record<string, ImageAsset>;
