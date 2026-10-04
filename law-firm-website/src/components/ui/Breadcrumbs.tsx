import Link from "next/link";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/structured-data";
import { JsonLd } from "./JsonLd";

/** Visible breadcrumb trail plus BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tracking-wide text-white/60">
          {trail.map((item, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-2">
                {isLast ? (
                  <span aria-current="page" className="text-white/85">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.href} className="link-underline transition-colors hover:text-white">
                      {item.name}
                    </Link>
                    <span aria-hidden="true" className="text-gold/70">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(trail)} />
    </>
  );
}
