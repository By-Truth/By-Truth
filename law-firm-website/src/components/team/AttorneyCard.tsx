import Link from "next/link";
import type { Attorney, PracticeArea } from "@/types/content";
import { Icon } from "@/components/ui/Icon";
import { AttorneyPortrait } from "./AttorneyPortrait";

interface AttorneyCardProps {
  attorney: Attorney;
  practiceAreas: PracticeArea[];
  headingLevel?: "h2" | "h3";
}

export function AttorneyCard({ attorney, practiceAreas, headingLevel: Heading = "h3" }: AttorneyCardProps) {
  const areas = practiceAreas.filter((area) => attorney.practiceAreaSlugs.includes(area.slug));
  const href = `/our-team/${attorney.slug}`;

  return (
    <article className="group flex h-full flex-col">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
        <AttorneyPortrait attorney={attorney} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
      </Link>
      <div className="flex flex-1 flex-col border-b border-line pt-7 pb-8">
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-gold-deep uppercase">{attorney.position}</p>
        <Heading className="mt-2 font-serif text-[1.75rem] leading-tight text-navy">
          <Link href={href} className="link-underline">
            {attorney.name}
          </Link>
        </Heading>
        {areas.length > 0 ? (
          <p className="mt-3 text-sm text-slate">{areas.map((area) => area.name).join(" · ")}</p>
        ) : null}
        <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-charcoal/80">{attorney.shortBio}</p>
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 self-start text-xs font-semibold tracking-[0.16em] text-navy uppercase transition-colors hover:text-gold-deep"
        >
          View Profile
          <span className="sr-only">: {attorney.name}</span>
          <Icon name="arrow-right" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
