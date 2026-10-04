import Image from "next/image";
import { site } from "@/data/site";
import { images } from "@/data/images";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate flex min-h-[640px] items-end overflow-hidden bg-navy text-white sm:min-h-[92svh]">
      <Image
        src={images.heroArchitecture.src}
        alt={images.heroArchitecture.alt}
        fill
        priority
        sizes="100vw"
        className="animate-fade-in -z-20 object-cover object-center"
      />
      {/* Layered overlay keeps text legible on any crop of the photograph. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy/60" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/60 to-navy/20" />
      <div aria-hidden="true" className="absolute inset-y-0 left-0 -z-10 w-full bg-gradient-to-r from-navy/80 to-transparent md:w-2/3" />

      <Container size="wide" className="pt-40 pb-16 sm:pb-24 lg:pb-28">
        <p className="eyebrow enter mb-8 text-gold">Commercial Law &amp; Legal Consultation</p>
        <h1 id="hero-heading" className="display-1 enter enter-delay-1 max-w-5xl">
          Trusted Legal Counsel.
          <span className="block text-white/90 italic">Strategic Representation.</span>
        </h1>
        <p className="lead enter enter-delay-2 mt-8 max-w-2xl text-white/80">
          {site.name} provides professional legal services to individuals, businesses and institutions, delivering
          thoughtful counsel and strategic representation across Nigeria.
        </p>
        <div className="enter enter-delay-3 mt-11 flex flex-col gap-4 sm:flex-row">
          <ButtonLink href="/consultation" variant="gold" withArrow>
            Book a Consultation
          </ButtonLink>
          <ButtonLink href="/practice-areas" variant="outline-light">
            Explore Our Practice Areas
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
