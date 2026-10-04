import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

type Variant = "gold" | "outline-light" | "outline-dark" | "navy";

const base =
  "group inline-flex min-h-12 items-center justify-center gap-3 px-7 py-3 text-[0.8rem] font-semibold tracking-[0.14em] uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-navy hover:bg-gold-light",
  navy: "bg-navy text-white hover:bg-navy-700",
  "outline-light": "border border-white/40 text-white hover:border-gold hover:text-gold-light",
  "outline-dark": "border border-navy/25 text-navy hover:border-navy hover:bg-navy hover:text-white",
};

export function buttonClasses(variant: Variant = "gold", className?: string) {
  return cn(base, variants[variant], className);
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  withArrow?: boolean;
  children: ReactNode;
}

export function ButtonLink({ variant = "gold", withArrow, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, className)} {...props}>
      <span>{children}</span>
      {withArrow ? (
        <Icon name="arrow-right" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      ) : null}
    </Link>
  );
}

interface ArrowLinkProps extends ComponentProps<typeof Link> {
  tone?: "dark" | "light";
  children: ReactNode;
}

/** Understated text link with a trailing arrow, e.g. "Learn More About Us →". */
export function ArrowLink({ tone = "dark", className, children, ...props }: ArrowLinkProps) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-2.5 text-sm font-semibold tracking-wide",
        tone === "dark" ? "text-navy hover:text-gold-deep" : "text-gold-light hover:text-white",
        "transition-colors duration-300",
        className,
      )}
      {...props}
    >
      <span className="link-underline pb-0.5">{children}</span>
      <Icon name="arrow-right" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
