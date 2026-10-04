import type { Attorney, PracticeArea } from "@/types/content";
import { ArrowLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AttorneyCard } from "@/components/team/AttorneyCard";

export function TeamSection({ attorneys, practiceAreas }: { attorneys: Attorney[]; practiceAreas: PracticeArea[] }) {
  return (
    <section aria-labelledby="team-heading" className="py-24 sm:py-32">
      <Container size="wide">
        <div className="reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="team-heading" eyebrow="Our People" title="Meet Our Legal Team" />
          <ArrowLink href="/our-team">View the Full Team</ArrowLink>
        </div>
        {attorneys.length > 0 ? (
          <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
            {attorneys.slice(0, 3).map((attorney) => (
              <li key={attorney.slug} className="reveal">
                <AttorneyCard attorney={attorney} practiceAreas={practiceAreas} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-16">
            <EmptyState title="Team profiles coming soon" />
          </div>
        )}
      </Container>
    </section>
  );
}
