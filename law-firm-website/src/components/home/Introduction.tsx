import Image from "next/image";
import { firmIntroduction } from "@/data/site";
import { images } from "@/data/images";
import { ArrowLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Introduction() {
  return (
    <section aria-labelledby="intro-heading" className="py-24 sm:py-32 lg:py-40">
      <Container size="wide" className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="relative lg:col-span-6">
          <div aria-hidden="true" className="absolute -top-5 -left-5 hidden h-2/3 w-2/3 border border-gold/40 sm:block" />
          <div className="reveal-image relative aspect-[4/3] overflow-hidden lg:aspect-[5/6]">
            <Image
              src={images.boardroom.src}
              alt={images.boardroom.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="reveal lg:col-span-5 lg:col-start-8">
          <p className="eyebrow mb-6 text-gold-deep">About the Firm</p>
          <h2 id="intro-heading" className="display-2 text-navy">
            {firmIntroduction.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <div className="mt-8 space-y-5 text-[1.0625rem] leading-[1.8] text-slate">
            {firmIntroduction.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ArrowLink href="/about" className="mt-10">
            Learn More About Us
          </ArrowLink>
        </div>
      </Container>
    </section>
  );
}
