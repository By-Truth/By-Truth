import Link from "next/link";
import type { ReactNode } from "react";
import { consultationCta, legalNavigation, mainNavigation, site } from "@/data/site";
import { getPracticeAreas } from "@/lib/content";
import { isProvided } from "@/lib/placeholder";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ContactDetails } from "./ContactDetails";

function FooterHeading({ children }: { children: ReactNode }) {
  return <h2 className="mb-6 font-sans text-[0.7rem] font-semibold tracking-[0.22em] text-gold uppercase">{children}</h2>;
}

const linkClass = "link-underline text-sm text-white/70 transition-colors hover:text-white";

export async function Footer() {
  const practiceAreas = await getPracticeAreas();
  const socialLinks = site.social.filter((link) => isProvided(link.href));
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-white">
      <Container size="wide" className="pt-20 pb-10 sm:pt-24">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-6 font-serif text-xl text-gold-light italic">{site.tagline}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">{site.description}</p>
            <div className="mt-8">
              <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.22em] text-white/50 uppercase">Follow Us</p>
              {socialLinks.length > 0 ? (
                <ul className="flex gap-3">
                  {socialLinks.map((link) => (
                    <li key={link.platform}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid size-10 place-items-center border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold"
                      >
                        <Icon name={link.platform} size={18} />
                        <span className="sr-only">{link.label} (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/50">[Social media links]</p>
              )}
            </div>
          </div>

          <nav aria-labelledby="footer-quick-links" className="lg:col-span-2">
            <FooterHeading>
              <span id="footer-quick-links">Quick Links</span>
            </FooterHeading>
            <ul className="space-y-3">
              {[...mainNavigation, consultationCta].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-practice-areas" className="lg:col-span-3">
            <FooterHeading>
              <span id="footer-practice-areas">Practice Areas</span>
            </FooterHeading>
            <ul className="space-y-3">
              {practiceAreas.map((area) => (
                <li key={area.slug}>
                  <Link href={`/practice-areas/${area.slug}`} className={linkClass}>
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <FooterHeading>Contact</FooterHeading>
            <ContactDetails tone="light" className="space-y-5 text-sm" />
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-white/10 pt-8 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name}. All Rights Reserved.
          </p>
          <p className="max-w-xl md:text-center">
            The content of this website is for general information only and does not constitute legal advice.
          </p>
          <ul className="flex gap-6">
            {legalNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
