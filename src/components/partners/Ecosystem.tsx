import { ArrowUpRight } from "lucide-react";
import { ORG_CATEGORY_META, ORG_CATEGORY_ORDER } from "@/config/ecosystem";
import { industries } from "@/content/industries";
import { publicOrganizations, publicPanelists, type PublicOrganization } from "@/lib/content";
import { LiquidButton } from "../liquid/LiquidButton";
import { Reveal } from "../liquid/Reveal";
import { OrgMark } from "./OrgMark";

const industryName = (slug: string | null) => industries.find((i) => i.slug === slug)?.short;

function group(orgs: PublicOrganization[]) {
  return ORG_CATEGORY_ORDER.map((c) => ({ category: c, meta: ORG_CATEGORY_META[c], orgs: orgs.filter((o) => o.category === c) })).filter((g) => g.orgs.length > 0);
}

/**
 * Homepage ecosystem: four separate roles, never a single "sponsors" wall. Each organisation is set in type
 * unless a logo has been approved. Hairlines, generous space, no cards.
 */
export async function EcosystemHome() {
  const orgs = await publicOrganizations();
  const groups = group(orgs);
  if (groups.length === 0) {
    return (
      <p className="display max-w-[28ch] text-3xl">Participating organisations will be named here once they have confirmed.</p>
    );
  }
  return (
    <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[0.8fr_1.4fr]">
      <Reveal className="lg:sticky lg:top-32 lg:self-start">
        <p className="lede">
          Kinds of support, kept distinct: who is hiring, where we film, and who is helping us reach students. Each is described only as far as it has been confirmed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LiquidButton href="/partners" variant="glass">Every organisation</LiquidButton>
          <LiquidButton href="/sponsors" variant="quiet">Become a partner <ArrowUpRight size={16} aria-hidden /></LiquidButton>
        </div>
      </Reveal>

      <div className="border-t border-[var(--fg)]">
        {groups.map((g, gi) => {
          // When every organisation in a group has the same role, say it once for the group.
          const sharedRole = g.orgs.length > 1 && g.orgs.every((o) => o.role && o.role === g.orgs[0].role) ? g.orgs[0].role : null;
          return (
            <Reveal key={g.category} delay={gi * 0.08} className="grid gap-4 border-b border-[var(--line)] py-8 sm:grid-cols-[11rem_1fr] sm:gap-10">
              <div>
                <p className="eyebrow">{String(gi + 1).padStart(2, "0")} · {g.meta.label}</p>
                {sharedRole && <p className="mt-3 max-w-[22ch] text-sm text-[var(--fg-dim)]">{sharedRole}</p>}
              </div>
              <ul className={`grid gap-x-10 gap-y-5 ${g.orgs.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {g.orgs.map((o) => (
                  <li key={o.id} className="group">
                    <OrgMark name={o.name} logo={o.logoPath} className="transition-transform duration-500 [transition-timing-function:var(--ease-cinema)] group-hover:-translate-y-0.5" />
                    {o.role && !sharedRole && <p className="mt-2 max-w-[40ch] text-sm text-[var(--fg-dim)]">{o.role}</p>}
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
        <p className="eyebrow pt-5">Named on the organiser&rsquo;s confirmation · logos shown only where approved</p>
      </div>
    </div>
  );
}

/** Full profiles for /partners, by role, with the limits of each relationship stated. */
export async function PartnerProfiles() {
  const [orgs, panelists] = await Promise.all([publicOrganizations(), publicPanelists()]);
  const groups = group(orgs);
  return (
    <div className="grid gap-24">
      {groups.map((g, gi) => {
        const sharedRole = g.orgs.length > 1 && g.orgs.every((o) => o.role && o.role === g.orgs[0].role) ? g.orgs[0].role : null;
        return (
        <section key={g.category} aria-labelledby={`cat-${g.category}`}>
          <Reveal>
            <p className="eyebrow">{String(gi + 1).padStart(2, "0")} · {g.meta.label}</p>
            <h2 id={`cat-${g.category}`} className="display h-lg mt-4 max-w-[16ch]">{g.meta.heading}</h2>
            <p className="lede mt-5">{g.meta.blurb}</p>
          </Reveal>
          {sharedRole ? (
            // Several organisations, one role: state it once, then give each its own plate. The logo slot has a fixed
            // height, so an approved logo replaces the typeset name without moving anything.
            <>
              <Reveal>
                <p className="mt-8 text-[var(--fg-dim)]"><span className="eyebrow mr-3">Role</span>{sharedRole}</p>
              </Reveal>
              <ul className="mt-10 grid border-t border-[var(--fg)] sm:grid-cols-2">
                {g.orgs.map((o, i) => (
                  <Reveal
                    as="li"
                    key={o.id}
                    delay={i * 0.07}
                    className="flex flex-col justify-between gap-6 border-b border-[var(--line)] py-7 sm:min-h-[13rem] sm:gap-10 sm:px-9 sm:py-9 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pl-0"
                  >
                    <div className="flex items-end sm:min-h-[4.5rem]">
                      <OrgMark name={o.name} logo={o.logoPath} size="lg" />
                    </div>
                    <div>
                      <p className="eyebrow">Participation confirmed by the organiser</p>
                      {o.description && <p className="mt-3 text-[var(--fg-dim)]">{o.description}</p>}
                      {o.industry && <p className="mt-3 text-sm text-[var(--fg-faint)]">Internship category: {industryName(o.industry)}</p>}
                      {o.websiteUrl && (
                        <a href={o.websiteUrl} target="_blank" rel="noopener noreferrer" className="link-u mt-3 inline-flex items-center gap-1 text-sm">
                          Official website <ArrowUpRight size={14} aria-hidden />
                        </a>
                      )}
                    </div>
                  </Reveal>
                ))}
              </ul>
            </>
          ) : (
          <ul className="mt-12 border-t border-[var(--fg)]">
            {g.orgs.map((o, i) => (
              <Reveal as="li" key={o.id} delay={i * 0.06} className="grid gap-5 border-b border-[var(--line)] py-9 md:grid-cols-[1fr_1.2fr] md:gap-14">
                <div>
                  <OrgMark name={o.name} logo={o.logoPath} size="lg" />
                  <p className="eyebrow mt-4">Participation confirmed by the organiser</p>
                </div>
                <div>
                  {o.role && <p className="display text-2xl leading-snug">{o.role}</p>}
                  {o.description && <p className="mt-3 text-[var(--fg-dim)]">{o.description}</p>}
                  {o.industry && <p className="mt-3 text-sm text-[var(--fg-faint)]">Internship category: {industryName(o.industry)}</p>}
                  {o.websiteUrl && (
                    <a href={o.websiteUrl} target="_blank" rel="noopener noreferrer" className="link-u mt-4 inline-flex items-center gap-1 text-sm">
                      Official website <ArrowUpRight size={14} aria-hidden />
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </ul>
          )}
          <p className="mt-5 max-w-[70ch] text-sm text-[var(--fg-faint)]">{g.meta.notes}</p>
        </section>
        );
      })}

      {panelists.length > 0 && (
        <section aria-labelledby="cat-panel">
          <Reveal>
            <p className="eyebrow">Panel</p>
            <h2 id="cat-panel" className="display h-lg mt-4">The people evaluating</h2>
          </Reveal>
          <ul className="mt-10 grid gap-6 border-t border-[var(--fg)] pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {panelists.map((p) => (
              <li key={p.id}>
                <p className="display text-2xl">{p.name}</p>
                <p className="text-[var(--fg-dim)]">{p.title}, {p.organization}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

