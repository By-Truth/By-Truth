"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[80svh] items-center bg-navy pt-36 pb-24 text-white">
      <Container>
        <p className="eyebrow mb-6 text-gold">Something went wrong</p>
        <h1 className="display-1 max-w-3xl">We could not load this page.</h1>
        <p className="lead mt-7 max-w-xl text-white/75">
          Please try again. If the problem continues, contact us by phone or email.
        </p>
        <div className="mt-11 flex flex-col gap-4 sm:flex-row">
          <button type="button" onClick={reset} className={buttonClasses("gold")}>
            Try Again
          </button>
          <Link href="/" className={buttonClasses("outline-light")}>
            Return Home
          </Link>
        </div>
      </Container>
    </section>
  );
}
