import type { Metadata } from "next";
import Link from "next/link";
import { publicEvents, seasonPhase, targetWindow } from "@/lib/content";
import { phaseMeta } from "@/config/ecosystem";
import { formatINR, pricing, season } from "@/config/site";
import { industries } from "@/content/industries";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { Reveal } from "@/components/liquid/Reveal";
import { EVENT_STATUS_LABEL, formatEventDate } from "@/lib/event-ui";
import type { EventStatus } from "@/config/site";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { PageShell } from "@/components/layout/PageShell";
import { FactCards, HonestNote, SlotBar } from "@/components/layout/FactCards";
import { Clock3, MapPin, Utensils } from "lucide-react";
import { ElasticPill } from "@/components/liquid/surfaces";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past editions of the live internship pitching event. Dates, venues and registration status, only when confirmed.",
  alternates: { canonical: "/events" },
};

async function SeasonOverview() {
  const [phaseKey, target] = await Promise.all([seasonPhase(), targetWindow()]);
  const phase = phaseMeta(phaseKey);
  const slot = season.slot;
  const rows: [string, string][] = [
    ["Status", phase.label],
    ["Date", season.date ?? "To be announced"],
    ...(target && !season.date ? ([["Target window", `${target} · a target, not a confirmed date`]] as [string, string][]) : []),
    ["Venue", "To be announced"],
    ["Industries", industries.map((i) => i.short).join(" · ")],
    ["Candidate ticket", `${formatINR(pricing.candidate.amount)} · food and goodies included · planned`],
    ["Audience ticket", `${formatINR(pricing.audience.amount)} · food and goodies included · planned`],
  ];
  return (
    <div className="mb-24 grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-24">
      <Reveal>
        <p className="eyebrow">{season.label} · {phase.label}</p>
        <h2 className="display h-lg mt-4 max-w-[14ch]">At a <em>glance.</em></h2>
        <p className="lede mt-5">{phase.copy}</p>
        <p className="mt-4 max-w-[48ch] text-sm text-[var(--fg-faint)]">Pricing and format are planned and may change. Tickets are not on sale yet, and there is no countdown because there is no confirmed date.</p>
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
      <div className="grid gap-8 lg:col-span-2">
        <FactCards
          items={[
            { icon: MapPin, title: "Venue to be announced", body: "Name, address and access details follow once confirmed." },
            { icon: Utensils, title: "Food and goodies included", body: "Candidates are evaluated by a panel. No internship is guaranteed." },
            { icon: Clock3, title: `${season.industryBlocks} blocks, about ${season.planned.candidatesPerEpisode} candidates each`, body: "One block per industry. The run of show is not final." },
          ]}
        />
        <Reveal>
          <p className="eyebrow mb-3">One candidate slot, proposed</p>
          <SlotBar pitch={slot.pitchMinutes} panel={slot.panelMinutes} transition={slot.transitionMinutes} />
        </Reveal>
        <HonestNote title="Filmed event">The event is filmed. See <Link className="link-u" href="/media-consent">filming and media consent</Link>.</HonestNote>
      </div>
    </div>
  );
}

export default async function Events() {
  const events = await publicEvents();
  return (
    <PageShell eyebrow="Events" art="events" title={events.length ? <>The <em>editions.</em></> : <>Event announcement <em>coming soon.</em></>} lede={events.length ? "Every confirmed edition, with its status stated plainly." : "No date or venue is confirmed yet. We won’t invent one."}>
      <SeasonOverview />
      {events.length === 0 ? (
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="display h-lg">Hear it first.</h2>
            <p className="mt-4 max-w-[48ch] text-[var(--fg-dim)]">Leave your email. We’ll write when the date is confirmed, and when registration opens. Nothing else.</p>
          </div>
          <div className="glass glass-frost max-w-md p-8 [--r:1.6rem]"><WaitlistForm kind="updates" cta="Notify me" note="event announcements" /></div>
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
