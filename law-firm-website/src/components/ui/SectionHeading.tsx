import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "dark",
  align = "left",
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  const light = tone === "light";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className={cn("eyebrow mb-5", light ? "text-gold" : "text-gold-deep", align === "center" && "justify-center")}>
          {eyebrow}
        </p>
      ) : null}
      <Heading id={id} className={cn("display-2", light ? "text-white" : "text-navy")}>
        {title}
      </Heading>
      {description ? (
        <p className={cn("lead mt-6", light ? "text-white/75" : "text-slate")}>{description}</p>
      ) : null}
    </div>
  );
}
