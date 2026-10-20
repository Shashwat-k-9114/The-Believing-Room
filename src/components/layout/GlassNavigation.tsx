"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { brand, socialLinks } from "@/config/site";
import { menuGroups, primaryNav } from "@/config/nav";
import { LiquidButton } from "../liquid/LiquidButton";
import { MorphingModal } from "../liquid/MorphingModal";
import { Wordmark } from "./Wordmark";

/**
 * Slim glass navigation (one of the few places optical glass is used).
 * It narrows slightly after scrolling. The full site map lives in a native-dialog
 * menu so the bar itself stays quiet.
 */
export function GlassNavigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header data-theme="dark" className="pointer-events-none fixed inset-x-0 top-0 z-50 !bg-transparent px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary"
        className={`glass glass-nav pointer-events-auto mx-auto flex max-w-[1180px] items-center justify-between gap-3 py-2 pl-5 pr-2 transition-[max-width] duration-700 [--r:999px] ${scrolled ? "max-w-[960px]" : ""}`}
      >
        <Link href="/" aria-label={`${brand.name}, home`} className="inline-flex min-h-11 shrink-0 items-center">
          <Wordmark compact />
        </Link>

        <ul className="hidden items-center gap-1 xl:flex">
          {primaryNav.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-full px-4 text-[0.92rem] tracking-wide transition-colors hover:text-white ${active ? "text-white" : "text-white/70"}`}
                >
                  {l.label}
                  {active && <span aria-hidden className="ml-2 size-1 rounded-full bg-[#cbae76]" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <LiquidButton href="/register/candidate" variant="primary" className="!min-h-11 !px-5 !text-sm max-sm:hidden">
            Apply as a Candidate
          </LiquidButton>
          <button
            ref={openerRef}
            type="button"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              setOpen(true);
            }}
            className="grid size-12 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
          >
            <Menu size={20} aria-hidden />
          </button>
        </div>
      </nav>

      <MorphingModal open={open} onClose={() => setOpen(false)} title="Site menu" origin={origin} returnFocus={openerRef} full>
        <div data-theme="dark" className="wrap pointer-events-auto grid min-h-dvh content-center gap-12 py-24 !bg-transparent">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {menuGroups.map((g) => (
              <div key={g.title}>
                <p className="eyebrow mb-5">{g.title}</p>
                <ul className="grid gap-1">
                  {g.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} onClick={() => setOpen(false)} className="display block py-1.5 text-3xl text-white/90 transition-colors hover:text-[#cbae76] sm:text-4xl">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6">
            {socialLinks.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="link-u text-sm text-white/70 hover:text-white">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </MorphingModal>
    </header>
  );
}
