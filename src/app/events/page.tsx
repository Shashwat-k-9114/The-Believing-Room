import type { Metadata } from "next";
import Link from "next/link";
import { publicEvents, publicOrganizations, seasonPhase, targetWindow } from "@/lib/queries";
import { phaseMeta } from "@/config/ecosystem";
import { formatINR, inclusions, pricing, season } from "@/config/site";
import { industries } from "@/content/industries";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { Reveal } from "@/components/liquid/Reveal";
import { EVENT_STATUS_LABEL, formatEventDate } from "@/lib/event-ui";
import type { EventStatus } from "@/config/site";
import { RegistrationGate } from "@/components/forms/RegistrationGate";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { PageShell } from "@/components/layout/PageShell";
import { ElasticPill } from "@/components/liquid/surfaces";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past editions of the live internship pitching event. Dates, venues and registration status, only when confirmed.",
  alternates: { canonical: "/events" },
};

async function SeasonOverview() {
  const [phaseKey, venue, target] = await Promise.all([seasonPhase(), publicOrganizations("venue"), targetWindow()]);
  const phase = phaseMeta(phaseKey);
  const slot = season.slot;
  const rows: [string, string][] = [
    ["Status", phase.label],
    ["Date", season.date ?? "To be announced"],
    ...(target && !season.date ? ([["Target window", `${target} · a target, not a confirmed date`]] as [string, string][]) : []),
    ["Location", "Greater Noida"],
    ["Industries", industries.map((i) => i.short).join(" · ")],
    ["Candidate ticket", `${formatINR(pricing.candidate.amount)} · food included · planned`],
    ["Audience ticket", `${formatINR(pricing.audience.amount)} · food included · planned`],
  ];
  return (
    <div className="mb-24 grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-24">
      <Reveal>
        <p className="eyebrow">{season.label} · {phase.label}</p>
        <h2 className="display h-lg mt-4 max-w-[14ch]">At a <em>glance.</em></h2>
        <p className="lede mt-5">{phase.copy}</p>
        <p className="mt-5 max-w-[56ch] text-sm text-[var(--fg-faint)]">
          Pricing and format below are planned and may change before the event is confirmed. Tickets are not on sale until registration opens; there is no countdown because there is no confirmed date.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LiquidButton href="/register/candidate" variant="primary" size="lg">Apply to pitch</LiquidButton>
          <LiquidButton href="/register/audience" variant="glass" size="lg">Audience tickets</LiquidButton>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <dl className="border-t border-[var(--fg)]">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 border-b border-[var(--line)] py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="eyebrow pt-1">{k}</dt>
              <dd className="display text-2xl">{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
      <Reveal className="lg:col-span-2">
        <div className="grid gap-10 border-t border-[var(--line)] pt-10 md:grid-cols-3">
          <div>
            <p className="eyebrow">Proposed format</p>
            <p className="mt-3 text-[var(--fg-dim)]">
              {season.industryBlocks} industry blocks of about {season.planned.candidatesPerEpisode} candidates each. Each slot: a {slot.pitchMinutes}-minute pitch, {slot.panelMinutes} minutes of panel questions and a {slot.transitionMinutes}-minute transition. Not final until the run of show is confirmed.
            </p>
          </div>
          <div>
            <p className="eyebrow">Venue</p>
            <p className="mt-3 text-[var(--fg-dim)]">
              {venue.length ? `Facilities are provided by ${venue.map((v) => v.name).join(", ")} at no charge: an auditorium and a podcast room. ` : ""}
              The exact venue name, address and access details will be published once confirmed. Filming and audio equipment are arranged separately.
            </p>
          </div>
          <div>
            <p className="eyebrow">Included</p>
            <p className="mt-3 text-[var(--fg-dim)]">{inclusions.both.join(". ")}. Candidates are evaluated by a panel; no internship is guaranteed. The event is filmed; see <Link className="link-u" href="/media-consent">filming and media consent</Link>.</p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default async function Events() {
  const events = await publicEvents();
  return (
    <PageShell eyebrow="Events" title={events.length ? <>The <em>editions.</em></> : <>Event announcement <em>coming soon.</em></>} lede={events.length ? "Every confirmed edition, with its status stated plainly." : "The first edition hasn’t been confirmed, so there is no date, venue or countdown to show. We won’t invent one."}>
      <SeasonOverview />
      {events.length === 0 ? (
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="display h-lg">Hear it first.</h2>
            <p className="mt-4 max-w-[48ch] text-[var(--fg-dim)]">Leave your email and we’ll write once, when the first date and venue are confirmed, and again when registration opens. Nothing else.</p>
          </div>
          <div className="glass glass-frost max-w-md p-8 [--r:1.6rem]"><RegistrationGate what="notification list"><WaitlistForm kind="updates" cta="Notify me" note="event announcements" /></RegistrationGate></div>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {events.map((e) => (
            <li key={e.id}>
              <Link href={`/events/${e.slug}`} className="grid gap-3 py-8 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="mono text-[var(--fg-faint)]">{e.edition ?? "Edition"}</p>
                  <h2 className="display h-lg mt-2">{e.title}</h2>
                  <p className="mt-2 text-[var(--fg-dim)]">{formatEventDate(e.startsAt) ?? "Date to be announced"}{e.venueName ? ` · ${e.venueName}` : ""}</p>
                </div>
                <ElasticPill tone={e.status === "registration_open" || e.status === "live" ? "live" : "neutral"}>{EVENT_STATUS_LABEL[e.status as EventStatus]}</ElasticPill>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
