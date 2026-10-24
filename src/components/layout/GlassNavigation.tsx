"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/config/site";
import { primaryNav } from "@/config/nav";
import { LiquidButton } from "../liquid/LiquidButton";
import { Wordmark } from "./Wordmark";

/**
 * Slim glass navigation (one of the few places optical glass is used).
 * It narrows slightly after scrolling. Desktop keeps the established inline links while
 * phones get a compact menu so the header never has to wrap.
 */
export function GlassNavigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const mobileNav = [primaryNav[0], primaryNav[2], primaryNav[1], primaryNav[3]];

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (media.matches) setMobileOpen(false);
    };
    closeOnDesktop();
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      toggleRef.current?.focus();
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMobileOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [mobileOpen]);

  const links = (items: typeof primaryNav, cls = "", onClick?: () => void) =>
    items.map((l) => {
      const active = pathname === l.href || pathname.startsWith(l.href + "/");
      return (
        <li key={l.href} className="shrink-0">
          <Link
            href={l.href}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            className={`${cls} inline-flex min-h-11 items-center rounded-full px-4 text-[0.92rem] tracking-wide transition-colors hover:text-white ${active ? "text-white" : "text-white/70"}`}
          >
            {cls ? (
              <>
                <span>{l.label}</span>
                <span aria-hidden className="mobile-menu-arrow">↗</span>
              </>
            ) : (
              <>
                {l.label}
                {active && <span aria-hidden className="ml-2 size-1 rounded-full bg-[#cbae76]" />}
              </>
            )}
          </Link>
        </li>
      );
    });

  return (
    <header ref={headerRef} data-theme="dark" className="site-nav-shell pointer-events-none fixed inset-x-0 top-0 z-50 !bg-transparent px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary"
        className={`glass glass-nav pointer-events-auto mx-auto flex max-w-[1180px] items-center justify-between gap-3 py-2 pl-5 pr-2 transition-[max-width] duration-700 [--r:999px] ${scrolled ? "max-w-[960px]" : ""}`}
      >
        <Link href="/" aria-label={`${brand.name}, home`} className="site-nav-home inline-flex min-h-11 min-w-0 shrink-0 items-center whitespace-nowrap" onClick={() => setMobileOpen(false)}>
          <Wordmark compact />
        </Link>

        <ul className="primary-nav-links">{links(primaryNav)}</ul>

        <LiquidButton href="/register/candidate" variant="primary" className="primary-nav-cta !min-h-11 !px-5 !text-sm">
          Apply as a Candidate
        </LiquidButton>

        <button
          ref={toggleRef}
          type="button"
          className="mobile-menu-toggle"
          data-open={mobileOpen ? "true" : undefined}
          aria-expanded={mobileOpen}
          aria-controls="mobile-primary-menu"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span aria-hidden />
          <span aria-hidden />
          <span aria-hidden />
        </button>
      </nav>

      <div
        ref={menuRef}
        id="mobile-primary-menu"
        className="mobile-menu-panel glass glass-nav pointer-events-auto"
        data-open={mobileOpen ? "true" : undefined}
        aria-hidden={!mobileOpen}
        aria-label="Mobile navigation"
        role="region"
        inert={!mobileOpen}
      >
        <ul aria-label="Mobile sections" className="mobile-menu-list">
          {links(mobileNav, "mobile-menu-link", () => setMobileOpen(false))}
        </ul>
      </div>
    </header>
  );
}
