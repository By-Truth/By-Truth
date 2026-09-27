import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/** Firm wordmark. Uses `site.logo` when an image logo has been supplied. */
export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label={`${site.name} — Home`}>
      {site.logo ? (
        <Image src={site.logo.src} alt="" width={site.logo.width} height={site.logo.height} className="h-10 w-auto" />
      ) : (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "grid size-10 shrink-0 place-items-center border font-serif text-lg transition-colors duration-300",
              tone === "light" ? "border-gold/60 text-gold" : "border-gold-deep/50 text-gold-deep",
            )}
          >
            {/* Monogram: first letter of the firm name, or a neutral mark while it is a placeholder. */}
            {/^\[/.test(site.name) ? "§" : site.name.charAt(0)}
          </span>
          <span
            className={cn(
              "font-serif text-lg leading-tight font-semibold tracking-[0.06em] sm:text-xl",
              tone === "light" ? "text-white" : "text-navy",
            )}
          >
            {site.name}
          </span>
        </>
      )}
    </Link>
  );
}
