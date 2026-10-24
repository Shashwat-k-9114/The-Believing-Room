import type { Metadata } from "next";
import { Suspense } from "react";
import { SponsorForm } from "@/components/forms/SponsorForm";
import { PageShell } from "@/components/layout/PageShell";
import { FactCards } from "@/components/layout/FactCards";
import { BadgeCheck, BarChart3, Building2, GraduationCap, Heart, Sparkles } from "lucide-react";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { Lines, Reveal } from "@/components/liquid/Reveal";
import { EcosystemHome } from "@/components/partners/Ecosystem";
import { publicOrganizations, publicSponsorshipPackages, targetWindow } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sponsor the room",
  description: "Partner with The Believing Room, an early-career recruitment show and podcast. Proposed founding partnership formats, how production is supported, and a working enquiry form.",
  alternates: { canonical: "/sponsors" },
};

const WHY = [
  { icon: Heart, title: "Early-career development", body: "Back a show that gives students a fair, visible chance." },
  { icon: GraduationCap, title: "Relevant student engagement", body: "Motivated candidates across four industries, with their consent." },
  { icon: Sparkles, title: "Professional visibility", body: "Agreed credits across the event and content. No audience figure is promised." },
  { icon: Building2, title: "Employer branding", body: "Be seen engaging with early-career talent." },
  { icon: BadgeCheck, title: "Ethical engagement", body: "Candidates are never marketed to or filmed without permission." },
  { icon: BarChart3, title: "Honest reporting", body: "A report against what was actually agreed. Nothing more is claimed." },
];

export default function Sponsors() {
  const packages = publicSponsorshipPackages();
  const recruiters = publicOrganizations("recruitment");
  const target = targetWindow();
  return (
    <PageShell
      eyebrow="Sponsors and partners"
      title={<>Help make <em>opportunity visible.</em></>}
      lede="Season 01 is in preparation: students pitching live to hiring professionals, filmed for YouTube. Founding partners are invited."
      art="partners"
      actions={
        <>
          <LiquidButton href="#enquiry" variant="primary" size="lg">Start a conversation</LiquidButton>
          <LiquidButton href="#prospectus" variant="glass" size="lg">Request the prospectus</LiquidButton>
        </>
      }
    >
      {/* At a glance: the six things a decision-maker needs, using only confirmed facts. */}
      <section aria-label="At a glance" className="mb-20 grid border-y border-[var(--fg)] sm:grid-cols-2 lg:mb-28 lg:grid-cols-4">
        {[
          { k: "The format", v: "Live pitches to hiring panels", d: "Candidates apply, are shortlisted and pitch in person." },
          { k: "Four industries", v: <>IT &amp; Technology<br />Finance &amp; Accounting<br />Sales &amp; Marketing<br />Animation &amp; Multimedia</>, d: "One block of the show for each." },
          ...(recruiters.length ? [{ k: "Recruiting participants", v: recruiters.map((o) => o.name).join(" · "), d: "Confirmed by the organiser." }] : []),
          { k: "What is produced", v: "A YouTube show and a podcast", d: target ? `Target window: ${target}. The date is not yet confirmed.` : "Season 01 is in preparation; the date is not yet confirmed." },
        ].map((c, i, a) => (
          <div key={c.k} className={`py-7 sm:px-7 ${i === 0 ? "sm:pl-0" : ""} ${i < a.length - 1 ? "border-b border-[var(--line)] sm:border-r lg:border-b-0" : ""}`}>
            <p className="eyebrow">{c.k}</p>
            <p className={`display mt-3 ${typeof c.v === "string" ? "text-2xl leading-snug" : "text-xl leading-normal"}`}>{c.v}</p>
            <p className="mt-3 text-sm text-[var(--fg-dim)]">{c.d}</p>
          </div>
        ))}
      </section>

      {/* The opportunity */}
      <section aria-labelledby="opportunity" className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <Reveal>
          <p className="eyebrow">The opportunity</p>
          <h2 id="opportunity" className="display h-lg mt-4 max-w-[14ch]">A first season, <em>honestly made.</em></h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lede">
            Season 01 is still in preparation. Dates are not announced, and the format figures are plans, not commitments. Founding partners help shape the first edition.
          </p>
        </Reveal>
      </section>

      {/* Confirmed ecosystem */}
      <section aria-labelledby="ecosystem" className="mt-28 border-t border-[var(--fg)] pt-16">
        <Reveal>
          <p className="eyebrow">The confirmed ecosystem</p>
          <h2 id="ecosystem" className="display h-lg mt-4 max-w-[20ch]">Who is already part of it</h2>
        </Reveal>
        <div className="mt-12"><EcosystemHome /></div>
      </section>

      {/* Why sponsor */}
      <section aria-labelledby="why" className="mt-28 border-t border-[var(--fg)] pt-16">
        <Reveal>
          <p className="eyebrow">Why partner</p>
          <h2 id="why" className="display h-lg mt-4 max-w-[16ch]">What a partnership offers</h2>
        </Reveal>
        <div className="mt-10"><FactCards items={WHY} /></div>
      </section>

      {/* Formats */}
      <section aria-labelledby="formats" className="mt-28 border-t border-[var(--fg)] pt-16">
        <Reveal>
          <p className="eyebrow">Partnership formats · proposed</p>
          <h2 id="formats" className="display h-lg mt-4 max-w-[16ch]">Five ways to take part</h2>
          <p className="lede mt-5">These are proposed formats, subject to commercial approval. Nothing below is a signed commitment, and amounts are shared in conversation unless one is shown.</p>
        </Reveal>
        <ul className="mt-12 grid gap-x-12 gap-y-14 md:grid-cols-2">
          {packages.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 2) * 0.08} className="border-t border-[var(--fg)] pt-6">
              <p className="eyebrow">{String(i + 1).padStart(2, "0")} · {p.price ?? "Shared on request"}</p>
              <h3 className="display mt-3 text-4xl">{p.name}</h3>
              <p className="mt-3 text-[var(--fg-dim)]">{p.summary}</p>
              <ul className="mt-5 grid gap-2 text-sm text-[var(--fg-dim)]">
                {p.deliverables.map((d) => (
                  <li key={d} className="border-t border-[var(--line)] pt-2">{d}</li>
                ))}
              </ul>
              <div className="mt-6"><LiquidButton href={`/sponsors?interest=${encodeURIComponent(p.name)}#enquiry`} variant="glass">Enquire about this format</LiquidButton></div>
            </Reveal>
          ))}
        </ul>
        {packages.length === 0 && <p className="mt-10 text-[var(--fg-dim)]">Partnership formats will be listed here once approved. In the meantime, please send an enquiry below.</p>}
      </section>

      {/* Production support */}
      <section aria-labelledby="support" className="mt-28 grid gap-12 border-t border-[var(--fg)] pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <Reveal>
          <p className="eyebrow">Production support</p>
          <Lines id="support" as="h2" className="display h-lg mt-4 max-w-[14ch]" lines={["The room is provided.", <em key="e">The making is not.</em>]} />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lede">
            The venue is yet to be announced. Filming, audio, lighting, hospitality and operations all need support.
          </p>
          <p className="mt-4 max-w-[58ch] text-sm text-[var(--fg-faint)]">We do not claim that any funding has been secured.</p>
        </Reveal>
      </section>

      {/* Deliverables */}
      <section aria-labelledby="deliverables" className="mt-28 border-t border-[var(--fg)] pt-16">
        <Reveal>
          <p className="eyebrow">Partnership deliverables</p>
          <h2 id="deliverables" className="display h-lg mt-4 max-w-[18ch]">Proposed inventory, not promises</h2>
        </Reveal>
        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <ul className="border-t border-[var(--fg)]">
            {["Approved event credits", "Signage, subject to venue authorisation", "Content acknowledgements in published episodes", "Sponsor showcase space where allowed", "Sponsor-specific QR engagement", "Agreed digital content deliverables", "Post-event reporting"].map((d) => (
              <li key={d} className="border-b border-[var(--line)] py-4 text-lg">{d}</li>
            ))}
          </ul>
          <div className="text-[var(--fg-dim)]">
            <p className="eyebrow">Signed commitments</p>
            <p className="display mt-3 text-3xl text-[var(--fg)]">None published yet.</p>
            <p className="mt-4 max-w-[52ch]">Items above are proposed inventory. Each becomes a commitment only when agreed in writing. We do not guarantee impressions, views, attendance or recruitment outcomes.</p>
          </div>
        </div>
      </section>

      {/* Prospectus */}
      <section id="prospectus" aria-labelledby="prospectus-h" className="mt-28 border-t border-[var(--fg)] pt-16 scroll-mt-28">
        <Reveal>
          <p className="eyebrow">Prospectus</p>
          <h2 id="prospectus-h" className="display h-lg mt-4 max-w-[16ch]">The sponsorship deck</h2>
          <p className="lede mt-5">The reviewed prospectus is not ready to download. Enquire below and we will send it when it is.</p>
          <div className="mt-8"><LiquidButton href="#enquiry" variant="primary" size="lg">Request the prospectus</LiquidButton></div>
        </Reveal>
      </section>

      {/* Enquiry */}
      <section id="enquiry" aria-labelledby="enquiry-h" className="mt-28 scroll-mt-28">
        <div className="glass glass-frost p-7 sm:p-10 [--r:1.2rem]">
          <h2 id="enquiry-h" className="display text-4xl sm:text-5xl">Partnership enquiry</h2>
          <p className="mb-8 mt-2 max-w-[56ch] text-[var(--fg-dim)]">Tell us who you are and what you have in mind. Your enquiry is saved securely and reviewed by a member of the team.</p>
          <Suspense fallback={null}><SponsorForm /></Suspense>
        </div>
      </section>
    </PageShell>
  );
}
