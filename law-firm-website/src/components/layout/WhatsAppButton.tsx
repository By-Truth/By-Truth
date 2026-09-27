import { site } from "@/data/site";
import { whatsappHref } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Floating WhatsApp link. Renders only once a real WhatsApp number has been
 * supplied in `src/data/site.ts` — a placeholder number is never linked.
 */
export function WhatsAppButton() {
  const href = whatsappHref(site.whatsapp, "Hello, I would like to make an enquiry.");
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex size-13 items-center justify-center border border-gold/50 bg-navy text-gold shadow-[0_10px_30px_-10px_rgba(11,22,40,0.6)] transition-colors duration-300 hover:bg-navy-700 hover:text-gold-light sm:right-6 sm:bottom-6"
    >
      <Icon name="whatsapp" size={24} />
      <span className="sr-only">Chat with us on WhatsApp (opens in a new tab)</span>
    </a>
  );
}
