import { industries } from "@/content/industries";
import { publicEducation, publicOpportunities } from "@/lib/content";
import { Reveal } from "../liquid/Reveal";

/**
 * The educational contribution, stated exactly as far as it has been confirmed. Course names, values,
 * durations, certificates and quantities appear only after the organiser marks the terms confirmed;
 * until then each line says so rather than inventing a value.
 */
export async function EducationBenefit() {
  const items = await publicEducation();
  if (items.length === 0) return null;
  return (
    <div className="grid gap-10">
      {items.map((e) => {
        const rows: [string, string | null][] = [
          ["Course", e.course],
          ["Who is eligible", e.eligibility],
          ["Access period", e.accessPeriod],
          ["Certificate", e.certificateTerms],
          ["Places", e.quantity],
        ];
        return (
          <Reveal key={e.id} className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <div>
              <p className="display text-3xl sm:text-4xl">{e.orgName}</p>
              <p className="lede mt-5">
                Candidates will have access to learning from {e.orgName} free of charge. It is a contribution to the candidate experience, separate from any hiring decision, and not a cash sponsorship.
              </p>
              <p className="mt-5 max-w-[56ch] text-sm text-[var(--fg-faint)]">
                Entitlements are subject to final published terms. Applying or being shortlisted does not by itself confirm access to any course.
              </p>
            </div>
            {e.termsConfirmed ? (
              <dl className="border-t border-[var(--fg)]">
                {rows.filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-6 border-b border-[var(--line)] py-4">
                    <dt className="text-[var(--fg-dim)]">{k}</dt>
                    <dd className="display text-right text-2xl">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="self-start border-t border-[var(--fg)] pt-5">
                <p className="eyebrow">Terms · to be published</p>
                <p className="display mt-3 max-w-[30ch] text-3xl leading-snug">Course names, eligibility, access period, certificate terms and places are published once confirmed.</p>
                <p className="mt-4 max-w-[48ch] text-sm text-[var(--fg-faint)]">We do not state course values or entitlements before the provider has confirmed them.</p>
              </div>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

/** Internship roles that a company has approved for publication. Empty until then, with an honest note. */
export async function OpportunityList() {
  const roles = await publicOpportunities();
  if (roles.length === 0)
    return (
      <p className="max-w-[62ch] text-[var(--fg-dim)]">
        Internship roles, openings, stipends, durations and locations will be listed here as each participating company confirms them. Nothing is listed on a company&rsquo;s behalf, and no offer is guaranteed.
      </p>
    );
  return (
    <ul className="border-t border-[var(--fg)]">
      {roles.map((r) => (
        <li key={r.id} className="grid gap-3 border-b border-[var(--line)] py-6 md:grid-cols-[1fr_1.4fr] md:gap-12">
          <div>
            <p className="eyebrow">{r.orgName}{r.industry ? ` · ${industries.find((i) => i.slug === r.industry)?.short}` : ""}</p>
            <h3 className="display mt-2 text-3xl">{r.roleTitle}</h3>
          </div>
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {([["Openings", r.openings?.toString()], ["Stipend", r.stipend], ["Duration", r.duration], ["Location", r.location], ["Mode", r.workMode], ["Eligibility", r.eligibility], ["Selection", r.selectionProcess]] as const)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}><dt className="eyebrow">{k}</dt><dd className="text-[var(--fg-dim)]">{v}</dd></div>
              ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}

/** One quiet line for the application page: what is on offer, with the limit stated. */
export async function EducationNote() {
  const items = await publicEducation();
  if (items.length === 0) return null;
  const names = items.map((i) => i.orgName).join(" and ");
  return (
    <p role="note" className="mb-10 rounded-xl border border-[var(--line)] p-4 text-sm text-[var(--fg-dim)]">
      <strong className="text-[var(--fg)]">Free learning for candidates.</strong> {names} {items.length > 1 ? "have" : "has"} confirmed free course access for candidates. Entitlements are subject to final published terms, and are separate from any hiring decision.
    </p>
  );
}
