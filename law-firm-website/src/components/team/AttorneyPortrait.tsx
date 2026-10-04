import Image from "next/image";
import type { Attorney } from "@/types/content";
import { isProvided } from "@/lib/placeholder";
import { cn } from "@/lib/utils";

interface AttorneyPortraitProps {
  attorney: Attorney;
  sizes: string;
  priority?: boolean;
  /** Small renders (e.g. article bylines) omit the placeholder caption. */
  compact?: boolean;
  className?: string;
}

/**
 * Portrait with a consistent 4:5 frame. Until a real photograph is supplied a
 * neutral placeholder is shown — never a stock photo of an unrelated person.
 */
export function AttorneyPortrait({ attorney, sizes, priority, compact, className }: AttorneyPortraitProps) {
  const initials = isProvided(attorney.name)
    ? attorney.name
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
    : undefined;

  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden bg-navy-800", className)}>
      {attorney.portrait ? (
        <Image
          src={attorney.portrait.src}
          alt={attorney.portrait.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover grayscale-[15%] transition-transform duration-700 ease-[var(--ease-elegant)] group-hover:scale-[1.03]"
        />
      ) : (
        <div
          role="img"
          aria-label={`Portrait placeholder for ${attorney.name}`}
          className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#1b2d4a,#0b1628_70%)]"
        >
          <span
            className={cn(
              "grid place-items-center rounded-full border border-gold/40 font-serif text-gold/80",
              compact ? "size-12 text-lg" : "size-24 text-3xl",
            )}
          >
            {initials ?? ""}
          </span>
          {compact ? null : (
            <span className="mt-5 text-[0.65rem] tracking-[0.22em] text-white/40 uppercase">[Portrait to be supplied]</span>
          )}
        </div>
      )}
    </div>
  );
}
