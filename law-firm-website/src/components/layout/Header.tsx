"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { consultationCta, mainNavigation } from "@/data/site";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Compact, solid header once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback((restoreFocus = true) => {
    setMenuOpen(false);
    if (restoreFocus) menuButtonRef.current?.focus();
  }, []);

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Mobile menu: lock scroll, trap focus, close on Escape or desktop resize.
  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => desktop.matches && closeMenu(false);

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [menuOpen, closeMenu]);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding] duration-500 ease-[var(--ease-elegant)]",
        solid ? "bg-navy/95 py-3 shadow-[0_1px_0_rgba(184,155,94,0.18)] backdrop-blur-md" : "bg-transparent py-5 sm:py-7",
      )}
    >
      <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8 xl:gap-10">
            {mainNavigation.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "link-underline py-1 text-[0.8125rem] font-medium tracking-[0.08em] transition-colors duration-300",
                      active ? "text-gold-light" : "text-white/85 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Link
              href={consultationCta.href}
              className={buttonClasses("gold", cn("transition-all", solid ? "min-h-10 px-5 py-2" : "min-h-11 px-6"))}
            >
              {consultationCta.label}
            </Link>
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="-mr-2 grid size-11 place-items-center text-white lg:hidden"
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <Icon name={menuOpen ? "close" : "menu"} size={24} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!menuOpen}
        className="fixed inset-x-0 top-[4.25rem] bottom-0 overflow-y-auto bg-navy lg:hidden"
      >
        <nav aria-label="Mobile" className="flex min-h-full flex-col px-5 pt-8 pb-10 sm:px-8">
          <ul className="border-t border-white/10">
            {mainNavigation.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="border-b border-white/10">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between py-5 font-serif text-3xl transition-colors",
                      active ? "text-gold-light" : "text-white hover:text-gold-light",
                    )}
                  >
                    {item.label}
                    <Icon name="arrow-right" size={20} className="text-gold" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href={consultationCta.href} className={buttonClasses("gold", "mt-10 w-full")}>
            {consultationCta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
