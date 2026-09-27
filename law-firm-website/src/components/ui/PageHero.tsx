import Image from "next/image";
import type { ReactNode } from "react";
import type { BreadcrumbItem } from "@/lib/structured-data";
import type { ImageAsset } from "@/types/content";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./Breadcrumbs";
import { Container } from "./Container";

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  image?: ImageAsset;
  children?: ReactNode;
  className?: string;
}

/** Dark introductory band used at the top of every inner page. */
export function PageHero({ eyebrow, title, description, breadcrumbs, image, children, className }: PageHeroProps) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-navy pt-36 pb-16 text-white sm:pt-44 sm:pb-24", className)}>
      {image ? (
        <>
          <Image
            src={image.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover opacity-30"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-navy/50" />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(184,155,94,0.12),transparent_60%)] md:block"
        />
      )}
      <Container>
        {breadcrumbs ? <div className="enter mb-10"><Breadcrumbs items={breadcrumbs} /></div> : null}
        {eyebrow ? <p className="eyebrow enter mb-6 text-gold">{eyebrow}</p> : null}
        <h1 className="display-1 enter enter-delay-1 max-w-4xl">{title}</h1>
        {description ? (
          <p className="lead enter enter-delay-2 mt-7 max-w-2xl text-white/75">{description}</p>
        ) : null}
        {children ? <div className="enter enter-delay-3 mt-10">{children}</div> : null}
      </Container>
    </section>
  );
}
