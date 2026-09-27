import Link from "next/link";
import type { PracticeArea } from "@/types/content";
import { Icon } from "@/components/ui/Icon";

/** Practice-area card: the whole card is one link, with a hover accent line. */
export function PracticeAreaCard({ area, index }: { area: PracticeArea; index: number }) {
  return (
    <Link
      href={`/practice-areas/${area.slug}`}
      className="group relative flex h-full flex-col bg-white p-8 transition-colors duration-500 hover:bg-navy sm:p-10"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100"
      />
      <div className="flex items-start justify-between">
        <Icon name={area.icon} size={30} strokeWidth={1.2} className="text-gold-deep transition-colors duration-500 group-hover:text-gold" />
        <span aria-hidden="true" className="font-serif text-sm text-slate/70 transition-colors duration-500 group-hover:text-white/40">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-10 font-serif text-[1.65rem] leading-tight text-navy transition-colors duration-500 group-hover:text-white">
        {area.name}
      </h3>
      <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-slate transition-colors duration-500 group-hover:text-white/70">
        {area.summary}
      </p>
      <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-navy uppercase transition-colors duration-500 group-hover:text-gold-light">
        Learn more
        <Icon name="arrow-right" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
