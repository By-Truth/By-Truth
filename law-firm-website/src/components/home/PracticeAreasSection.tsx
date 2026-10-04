import type { PracticeArea } from "@/types/content";
import { ArrowLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PracticeAreaCard, practiceGridClasses } from "@/components/practice/PracticeAreaCard";

export function PracticeAreasSection({ areas }: { areas: PracticeArea[] }) {
  return (
    <section aria-labelledby="practice-heading" className="bg-ivory-200 py-24 sm:py-32">
      <Container size="wide">
        <div className="reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow mb-5 text-gold-deep">Expertise</p>
            <h2 id="practice-heading" className="display-2 text-navy">
              Our Practice Areas
            </h2>
          </div>
          <p className="lead max-w-md text-slate">
            Focused legal expertise designed to help our clients navigate complex legal and commercial matters.
          </p>
        </div>

        {areas.length > 0 ? (
          <ul className={`reveal mt-16 grid gap-px border border-line bg-line ${practiceGridClasses(areas.length)}`}>
            {areas.map((area, index) => (
              <li key={area.slug}>
                <PracticeAreaCard area={area} index={index} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-16">
            <EmptyState title="Practice areas coming soon" />
          </div>
        )}

        <div className="mt-12 flex justify-end">
          <ArrowLink href="/practice-areas">View All Practice Areas</ArrowLink>
        </div>
      </Container>
    </section>
  );
}
