import { site } from "@/data/site";
import { isProvided } from "@/lib/placeholder";
import { cn, mailtoHref, telHref, whatsappHref } from "@/lib/utils";
import { Icon, type UiIconName } from "@/components/ui/Icon";

interface Detail {
  icon: UiIconName;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

export function getContactDetails(): Detail[] {
  const { street, city, state, country } = site.address;
  return [
    {
      icon: "map-pin",
      label: "Office Address",
      value: [street, city, state, country].join(", "),
    },
    { icon: "phone", label: "Phone", value: site.phone, href: telHref(site.phone) },
    { icon: "mail", label: "Email", value: site.email, href: mailtoHref(site.email) },
    {
      icon: "whatsapp",
      label: "WhatsApp",
      value: site.whatsapp,
      href: whatsappHref(site.whatsapp),
      external: true,
    },
  ];
}

/**
 * Address / phone / email / WhatsApp list. Placeholder values are shown as
 * plain text; supplied values become tel:, mailto: and wa.me links.
 */
export function ContactDetails({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const light = tone === "light";
  return (
    <ul className={cn("space-y-6", className)}>
      {getContactDetails().map((detail) => (
        <li key={detail.label} className="flex gap-4">
          <Icon name={detail.icon} size={20} className={cn("mt-0.5 shrink-0", light ? "text-gold" : "text-gold-deep")} />
          <div>
            <p className={cn("text-[0.7rem] font-semibold tracking-[0.18em] uppercase", light ? "text-white/55" : "text-slate")}>
              {detail.label}
            </p>
            {detail.href ? (
              <a
                href={detail.href}
                {...(detail.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={cn("link-underline mt-1 inline-block", light ? "text-white" : "text-navy")}
              >
                {detail.value}
                {detail.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </a>
            ) : (
              <p className={cn("mt-1", light ? "text-white/85" : "text-navy")}>{detail.value}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function hasProvidedAddress() {
  return isProvided(site.address.street);
}
