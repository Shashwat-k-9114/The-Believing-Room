import Link from "next/link";
import { brand, socialLinks } from "@/config/site";
import { legalNav, menuGroups } from "@/config/nav";
import { Wordmark } from "./Wordmark";

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Platform marks, drawn inline so the footer loads no icon font or extra request. */
function SocialIcon({ name }: { name: (typeof socialLinks)[number]["key"] }) {
  const svg = { viewBox: "0 0 24 24", width: 20, height: 20, "aria-hidden": true } as const;
  switch (name) {
    case "youtube":
      return <svg {...svg} fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
    case "instagram":
      return <svg {...svg} {...line}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>;
    case "linkedin":
      return <svg {...svg} {...line}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
    case "x":
      return <svg {...svg} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
    case "reddit":
      return <svg {...svg} {...line}><ellipse cx="12" cy="14" rx="8" ry="5.5" /><circle cx="9" cy="13.5" r="1" fill="currentColor" /><circle cx="15" cy="13.5" r="1" fill="currentColor" /><path d="M9.2 16.6c1.7 1.1 3.9 1.1 5.6 0M12 8.5l1.4-5.2 4 1" /><circle cx="18" cy="4.6" r="1.4" /><circle cx="4.4" cy="11.4" r="1.7" /><circle cx="19.6" cy="11.4" r="1.7" /></svg>;
  }
}

export function Footer() {
  return (
    <footer data-theme="dark" className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint]"><div aria-hidden className="footer-b" /></div>
      <div className="wrap grid gap-16 border-t border-[var(--line)] py-20 lg:grid-cols-[1fr_1.7fr]">
        <div>
          <Wordmark />
          <p className="display mt-8 max-w-xs text-2xl italic text-[var(--fg-dim)]">{brand.tagline}</p>
          <ul className="mt-8 flex flex-wrap gap-3" aria-label="Social channels">
            {socialLinks.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} (opens in a new tab)`} title={s.label}
                  className="grid size-11 place-items-center rounded-full border border-[var(--line)] text-[var(--fg-dim)] transition-colors hover:border-[#cbae76] hover:text-[#cbae76]"
                >
                  <SocialIcon name={s.key} />
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
            © 2026 {brand.name}. A ticket does not guarantee an internship offer.
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
