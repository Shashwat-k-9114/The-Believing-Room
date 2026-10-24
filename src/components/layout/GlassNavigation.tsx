"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand } from "@/config/site";
import { primaryNav } from "@/config/nav";
import { LiquidButton } from "../liquid/LiquidButton";
import { Wordmark } from "./Wordmark";

/**
 * Slim glass navigation (one of the few places optical glass is used).
 * It narrows slightly after scrolling. The links sit in the bar on wide screens and in a
 * scrolling strip under it on narrow ones; the full site map lives in the footer.
 */
export function GlassNavigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);

  const links = (cls: string) =>
    primaryNav.map((l) => {
      const active = pathname === l.href || pathname.startsWith(l.href + "/");
      return (
        <li key={l.href} className="shrink-0">
          <Link
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`${cls} inline-flex min-h-11 items-center rounded-full px-4 text-[0.92rem] tracking-wide transition-colors hover:text-white ${active ? "text-white" : "text-white/70"}`}
          >
            {l.label}
            {active && <span aria-hidden className="ml-2 size-1 rounded-full bg-[#cbae76]" />}
          </Link>
        </li>
      );
    });

  return (
    <header data-theme="dark" className="pointer-events-none fixed inset-x-0 top-0 z-50 !bg-transparent px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary"
        className={`glass glass-nav pointer-events-auto mx-auto flex max-w-[1180px] items-center justify-between gap-3 py-2 pl-5 pr-2 transition-[max-width] duration-700 [--r:999px] ${scrolled ? "max-w-[960px]" : ""}`}
      >
        <Link href="/" aria-label={`${brand.name}, home`} className="inline-flex min-h-11 shrink-0 items-center">
          <Wordmark compact />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">{links("")}</ul>

        <LiquidButton href="/register/candidate" variant="primary" className="!min-h-11 !px-5 !text-sm max-sm:hidden">
          Apply as a Candidate
        </LiquidButton>
      </nav>

      <ul
        aria-label="Sections"
        className="glass glass-nav pointer-events-auto mx-auto mt-2 flex max-w-[1180px] items-center gap-1 overflow-x-auto px-2 py-1 [--r:999px] lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {links("")}
      </ul>
    </header>
  );
}
