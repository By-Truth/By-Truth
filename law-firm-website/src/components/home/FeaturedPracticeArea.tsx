import Image from "next/image";
import type { PracticeArea } from "@/types/content";
import { ArrowLink } from "@/components/ui/Button";

/** Editorial, asymmetric feature: full-bleed image with an overlapping text panel. */
export function FeaturedPracticeArea({ area }: { area: PracticeArea }) {
  return (
    <section aria-labelledby="featured-heading" className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-12 lg:items-center">
        <div className="reveal-image relative aspect-[4/3] lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:aspect-[16/11]">
          <Image src={area.image.src} alt={area.image.alt} fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" />
        </div>
        <div className="reveal relative z-10 mx-5 -mt-20 bg-navy p-8 text-white sm:mx-8 sm:p-12 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:mx-0 lg:mt-0 lg:mr-12 lg:p-14 xl:p-16">
          <p className="eyebrow mb-6 text-gold">Featured Practice Area</p>
          <h2 id="featured-heading" className="display-3 text-white">
            {area.name}
          </h2>
          <p className="mt-6 leading-relaxed text-white/75">{area.summary}</p>
          {area.services.length > 0 ? (
            <ul className="mt-8 space-y-3 border-t border-white/10 pt-8 text-sm text-white/80">
              {area.services.slice(0, 4).map((service, index) => (
                <li key={`${service}-${index}`} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-gold" />
                  {service}
                </li>
              ))}
            </ul>
          ) : null}
          <ArrowLink href={`/practice-areas/${area.slug}`} tone="light" className="mt-10">
            Learn More
            <span className="sr-only"> about {area.name}</span>
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
