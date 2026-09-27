import type { Attorney } from "@/types/content";

/**
 * Legal team.
 *
 * Every entry below is a placeholder. Replace each one with verified
 * information supplied by the lawyer concerned — never add qualifications,
 * memberships or credentials that have not been confirmed.
 *
 * - Add a portrait by placing the image in /public/images/team and setting
 *   `portrait`. Until then a neutral placeholder is shown.
 * - `publications` is only displayed when it contains entries.
 * - Update `slug` to match the lawyer's name (e.g. "adaeze-okafor").
 */
export const attorneys: Attorney[] = [
  {
    slug: "team-member-1",
    name: "[Lawyer Full Name]",
    position: "[Position]",
    practiceAreaSlugs: ["practice-area-1", "practice-area-2"],
    shortBio: "[Short biography — two or three sentences. To be supplied.]",
    biography: [
      "[Full biography — professional background and areas of focus. To be supplied by the lawyer.]",
      "[Additional biography paragraph. To be supplied by the lawyer.]",
    ],
    education: ["[Degree — Institution — Year]"],
    qualifications: ["[Professional qualification]"],
    memberships: ["[Professional membership]"],
    publications: [],
    email: "[LAWYER EMAIL]",
  },
  {
    slug: "team-member-2",
    name: "[Lawyer Full Name]",
    position: "[Position]",
    practiceAreaSlugs: ["practice-area-3", "practice-area-4"],
    shortBio: "[Short biography — two or three sentences. To be supplied.]",
    biography: [
      "[Full biography — professional background and areas of focus. To be supplied by the lawyer.]",
    ],
    education: ["[Degree — Institution — Year]"],
    qualifications: ["[Professional qualification]"],
    memberships: ["[Professional membership]"],
    publications: [],
    email: "[LAWYER EMAIL]",
  },
  {
    slug: "team-member-3",
    name: "[Lawyer Full Name]",
    position: "[Position]",
    practiceAreaSlugs: ["practice-area-5", "practice-area-6"],
    shortBio: "[Short biography — two or three sentences. To be supplied.]",
    biography: [
      "[Full biography — professional background and areas of focus. To be supplied by the lawyer.]",
    ],
    education: ["[Degree — Institution — Year]"],
    qualifications: ["[Professional qualification]"],
    memberships: ["[Professional membership]"],
    publications: [],
    email: "[LAWYER EMAIL]",
  },
];
