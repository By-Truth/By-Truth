import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/data/site";
import { images } from "@/data/images";
import { buildMetadata } from "@/lib/seo";
import { ContactDetails } from "@/components/layout/ContactDetails";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description: `Contact ${site.name}. Find our office address, phone, email, WhatsApp and business hours, or send us a message.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in Touch"
        description="Reach our office by phone, email or WhatsApp, or send us a message and a member of our team will respond."
        breadcrumbs={[{ name: "Contact", href: "/contact" }]}
        image={images.towersMonochrome}
      />

      <section className="py-20 sm:py-28">
        <Container size="wide" className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="space-y-14 lg:col-span-5">
            <div>
              <h2 className="display-3 text-navy">Our Office</h2>
              <ContactDetails className="mt-10" />
            </div>

            <div className="border-t border-line pt-10">
              <h2 className="flex items-center gap-3 font-serif text-2xl text-navy">
                <Icon name="clock" size={20} className="text-gold-deep" />
                Business Hours
              </h2>
              <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
                {site.businessHours.map((row) => (
                  <div key={row.days} className="flex justify-between gap-6 py-4">
                    <dt className="text-slate">{row.days}</dt>
                    <dd className="text-right font-medium text-navy">{row.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="border border-line bg-white p-6 sm:p-10 lg:p-12">
              <h2 className="display-3 text-navy">How Can We Help?</h2>
              <p className="mt-4 mb-10 text-slate">
                Send us a general enquiry using the form below. To arrange a meeting with a lawyer, please{" "}
                <Link href="/consultation" className="font-semibold text-navy underline underline-offset-2 hover:text-gold-deep">
                  request a consultation
                </Link>
                .
              </p>
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="map-heading" className="pb-20 sm:pb-28">
        <Container size="wide">
          <h2 id="map-heading" className="sr-only">
            Office location map
          </h2>
          {site.mapEmbedUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden border border-line sm:aspect-[21/9]">
              <iframe
                src={site.mapEmbedUrl}
                title={`Map showing the location of ${site.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full grayscale-[40%]"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 border border-dashed border-line bg-ivory-200 px-6 text-center sm:aspect-[21/9]">
              <Icon name="map-pin" size={28} className="text-gold-deep" />
              <p className="font-serif text-2xl text-navy">[Office map]</p>
              <p className="max-w-md text-sm text-slate">
                An interactive map will appear here once the office address has been confirmed.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
