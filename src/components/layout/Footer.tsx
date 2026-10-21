import Link from "next/link";
import { brand, formatINR, pricing, socialLinks } from "@/config/site";
import { legalNav, menuGroups } from "@/config/nav";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer data-theme="dark" className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint]"><div aria-hidden className="footer-b" /></div>
      <div className="wrap grid gap-16 border-t border-[var(--line)] py-20 lg:grid-cols-[1fr_1.7fr]">
        <div>
          <Wordmark />
          <p className="display mt-8 max-w-xs text-2xl italic text-[var(--fg-dim)]">{brand.tagline}</p>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2" aria-label="Social channels">
            {socialLinks.map((s) => (
              <li key={s.key}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-u text-sm text-[var(--fg-dim)] hover:text-[var(--fg)]">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <a className="link-u mt-5 inline-block text-sm" href={`mailto:${brand.contactEmail}`}>
            {brand.contactEmail}
          </a>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {menuGroups.map((g) => (
            <div key={g.title}>
              <p className="eyebrow mb-5">{g.title}</p>
              <ul className="grid gap-1.5">
                {g.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="inline-flex min-h-9 items-center text-sm text-[var(--fg-dim)] hover:text-[var(--fg)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="wrap flex flex-col gap-4 py-7 text-xs text-[var(--fg-faint)] md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 {brand.name}. Candidate ticket {formatINR(pricing.candidate.amount)} · Audience ticket {formatINR(pricing.audience.amount)} · Food included. A ticket does not guarantee an internship offer.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-8 items-center hover:text-[var(--fg)]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
