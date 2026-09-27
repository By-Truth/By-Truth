import type { Metadata } from "next";
import { site } from "@/data/site";
import { images } from "@/data/images";
import { getPracticeAreas } from "@/lib/content";
import { GENERAL_MATTER_OPTIONS } from "@/lib/forms/validation";
import { buildMetadata } from "@/lib/seo";
import { telHref } from "@/lib/utils";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = buildMetadata({
  title: "Request a Consultation",
  description: `Request a consultation with ${site.name}. Tell us briefly about your legal matter and we will contact you to arrange a meeting.`,
  path: "/consultation",
});

const steps = [
  {
    title: "Submit your request",
    text: "Share your contact details and a short, general outline of your matter.",
  },
  {
    title: "We review and respond",
    text: "A member of our team will contact you to confirm availability and discuss next steps.",
  },
  {
    title: "Meet with a lawyer",
    text: "Your consultation takes place in person, by phone or by video — whichever you prefer.",
  },
];

export default async function ConsultationPage() {
  const areas = await getPracticeAreas();
  const matterOptions = [...areas.map((area) => ({ value: area.slug, label: area.name })), ...GENERAL_MATTER_OPTIONS];
  const phoneLink = telHref(site.phone);

  return (
    <>
      <PageHero
        eyebrow="Consultation"
        title="Request a Consultation"
        description="Tell us briefly about your legal matter and our team will contact you to arrange a consultation."
        breadcrumbs={[{ name: "Consultation", href: "/consultation" }]}
        image={images.boardroom}
      />

      <section className="py-20 sm:py-28">
        <Container size="wide" className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <aside className="lg:col-span-4">
            <h2 className="display-3 text-navy">What to expect</h2>
            <ol className="mt-10 space-y-8">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-5">
                  <span aria-hidden="true" className="font-serif text-3xl leading-none text-gold-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-sans text-base font-semibold text-navy">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-12 border-t border-line pt-8 text-sm leading-relaxed text-slate">
              <p>
                Prefer to speak to someone?{" "}
                {phoneLink ? (
                  <>
                    Call us on{" "}
                    <a href={phoneLink} className="font-semibold text-navy underline underline-offset-2">
                      {site.phone}
                    </a>
                    .
                  </>
                ) : (
                  <>Call us on {site.phone}.</>
                )}
              </p>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="border border-line bg-white p-6 sm:p-10 lg:p-12">
              <ConsultationForm matterOptions={matterOptions} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
