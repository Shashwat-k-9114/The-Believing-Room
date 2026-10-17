import type { Metadata } from "next";
import Link from "next/link";
import { publicEvents } from "@/lib/queries";
import { EVENT_STATUS_LABEL, formatEventDate } from "@/lib/event-ui";
import type { EventStatus } from "@/config/site";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { PageShell } from "@/components/layout/PageShell";
import { ElasticPill } from "@/components/liquid/surfaces";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past editions of the live internship pitching event. Dates, venues and registration status, only when confirmed.",
  alternates: { canonical: "/events" },
};

export default async function Events() {
  const events = await publicEvents();
  return (
    <PageShell eyebrow="Events" title={events.length ? <>The <em>editions.</em></> : <>Event announcement <em>coming soon.</em></>} lede={events.length ? "Every confirmed edition, with its status stated plainly." : "The first edition hasn’t been confirmed, so there is no date, venue or countdown to show. We won’t invent one."}>
      {events.length === 0 ? (
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="display h-lg">Hear it first.</h2>
            <p className="mt-4 max-w-[48ch] text-[var(--fg-dim)]">Leave your email and we’ll write once, when the first date and venue are confirmed, and again when registration opens. Nothing else.</p>
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
