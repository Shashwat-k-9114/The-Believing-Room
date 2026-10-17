"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { brand } from "@/config/site";
import { menuGroups, primaryNav } from "@/config/nav";
import { LiquidButton } from "../liquid/LiquidButton";
import { MorphingModal } from "../liquid/MorphingModal";
import { Wordmark } from "./Wordmark";

/**
 * Floating glass navigation. Compacts after scrolling; the full site map lives
 * in a native-dialog menu so the bar itself stays uncluttered.
 */
export function GlassNavigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header data-theme="dark" className="pointer-events-none fixed inset-x-0 top-0 z-50 !bg-transparent px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary"
        className={`glass glass-frost glass-lens pointer-events-auto mx-auto flex max-w-[1180px] items-center justify-between gap-3 py-2 pl-5 pr-2 transition-[padding,max-width] duration-500 [--r:999px] ${scrolled ? "max-w-[980px]" : ""}`}
      >
        <Link href="/" aria-label={`${brand.shortName}, home`} className="shrink-0">
          <Wordmark compact />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm transition-colors hover:text-white ${active ? "bg-white/10 text-white" : "text-white/70"}`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <LiquidButton href="/register/student" variant="primary" className="!min-h-11 !px-5 !text-sm max-sm:hidden">
            Enter the Arena
          </LiquidButton>
          <button
            type="button"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              setOpen(true);
            }}
            className="glass grid size-12 place-items-center text-white [--r:999px]"
          >
            <Menu size={20} aria-hidden />
          </button>
        </div>
      </nav>

      <MorphingModal open={open} onClose={() => setOpen(false)} title="Site menu" origin={origin} full>
        <div data-theme="dark" className="wrap pointer-events-auto grid min-h-dvh content-center gap-10 py-24 !bg-transparent">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {menuGroups.map((g) => (
              <div key={g.title}>
                <p className="eyebrow mb-4">{g.title}</p>
                <ul className="grid gap-1">
                  {g.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="display block py-1.5 text-3xl text-white/90 transition-colors hover:text-[var(--accent)] sm:text-4xl"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <LiquidButton href="/register/student" variant="primary" size="lg" onClick={() => setOpen(false)}>
              Enter the Arena
            </LiquidButton>
            <LiquidButton href="/register/audience" variant="glass" size="lg" onClick={() => setOpen(false)}>
              Attend the Show
            </LiquidButton>
          </div>
        </div>
      </MorphingModal>
    </header>
  );
}
