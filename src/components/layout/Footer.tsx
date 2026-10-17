import Link from "next/link";
import { brand, formatINR, pricing } from "@/config/site";
import { legalNav, menuGroups } from "@/config/nav";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer data-theme="dark" className="relative border-t border-white/10">
      <div className="wrap grid gap-14 py-20 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Wordmark />
          <p className="lede mt-6 max-w-sm !text-base">{brand.tagline}</p>
          <p className="mt-6 text-sm text-[var(--fg-faint)]">
            Student Pass {formatINR(pricing.student.amount)} · Audience Pass {formatINR(pricing.audience.amount)}
            {pricing.foodIncluded ? " · Food included" : ""}
          </p>
          {brand.contactEmail ? (
            <a className="mt-3 inline-block text-sm underline underline-offset-4" href={`mailto:${brand.contactEmail}`}>
              {brand.contactEmail}
            </a>
          ) : (
            <Link className="mt-3 inline-block text-sm underline underline-offset-4" href="/contact">
              Contact us
            </Link>
          )}
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {menuGroups.map((g) => (
            <div key={g.title}>
              <p className="eyebrow mb-4">{g.title}</p>
              <ul className="grid gap-1">
                {g.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="inline-flex min-h-9 items-center text-sm text-white/70 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-4 py-6 text-xs text-[var(--fg-faint)] md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}. Provisional brand. Independent event; not affiliated with any television programme.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-8 items-center hover:text-white">
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
