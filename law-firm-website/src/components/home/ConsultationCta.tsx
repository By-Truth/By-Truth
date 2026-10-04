import Image from "next/image";
import { images } from "@/data/images";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

interface ConsultationCtaProps {
  title?: string;
  text?: string;
  buttonLabel?: string;
}

export function ConsultationCta({
  title = "Need Legal Counsel?",
  text = "Speak with our team about your legal matter.",
  buttonLabel = "Request a Consultation",
}: ConsultationCtaProps) {
  return (
    <section aria-labelledby="cta-heading" className="relative isolate overflow-hidden bg-navy py-24 text-white sm:py-32">
      <Image src={images.glassFacade.src} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/95 to-navy/70" />
      <Container size="wide" className="reveal flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow mb-6 text-gold">Consultation</p>
          <h2 id="cta-heading" className="display-2">
            {title}
          </h2>
          <p className="lead mt-6 text-white/75">{text}</p>
        </div>
        <ButtonLink href="/consultation" variant="gold" withArrow className="self-start lg:self-center">
          {buttonLabel}
        </ButtonLink>
      </Container>
    </section>
  );
}
