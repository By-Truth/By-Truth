import type { Principle } from "@/types/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Principles({ principles }: { principles: Principle[] }) {
  return (
    <section aria-labelledby="principles-heading" className="bg-navy py-24 text-white sm:py-32">
      <Container size="wide">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="reveal lg:col-span-4">
            <SectionHeading
              id="principles-heading"
              eyebrow="Our Approach"
              title="Why Clients Choose Us"
              description="The principles that guide how we advise, represent and communicate with every client."
              tone="light"
            />
          </div>
          <ol className="grid gap-px bg-white/10 sm:grid-cols-2 lg:col-span-8">
            {principles.map((principle, index) => (
              <li key={principle.title} className="reveal bg-navy p-8 sm:p-10">
                <span aria-hidden="true" className="font-serif text-4xl text-gold/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-serif text-2xl text-white">{principle.title}</h3>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-white/70">{principle.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
