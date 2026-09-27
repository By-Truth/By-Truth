import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center bg-navy pt-36 pb-24 text-white">
      <Container>
        <p className="eyebrow mb-6 text-gold">Error 404</p>
        <h1 className="display-1 max-w-3xl">This page could not be found.</h1>
        <p className="lead mt-7 max-w-xl text-white/75">
          The page you are looking for may have been moved or no longer exists. Please use the links below to continue.
        </p>
        <div className="mt-11 flex flex-col gap-4 sm:flex-row">
          <ButtonLink href="/" withArrow>
            Return Home
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline-light">
            Contact Us
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
