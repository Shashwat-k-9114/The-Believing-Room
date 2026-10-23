import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatINR, pricing, type EventStatus } from "@/config/site";
import { industries } from "@/content/industries";
import { publicEvent } from "@/lib/content";
import { EVENT_STATUS_LABEL, formatEventDate, formatEventTime } from "@/lib/event-ui";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { PageShell } from "@/components/layout/PageShell";
import { ElasticPill } from "@/components/liquid/surfaces";
import { brand } from "@/config/site";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await publicEvent((await params).slug);
  return e ? { title: e.title, description: e.summary ?? `${e.title}: live internship pitching.`, alternates: { canonical: `/events/${e.slug}` } } : {};
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = await publicEvent((await params).slug);
  if (!e) notFound();
  const status = e.status as EventStatus;
  const date = formatEventDate(e.startsAt);
  const agenda = e.agenda ?? [];
  const rules = e.rules ?? [];

  // Event structured data only when date and venue are confirmed.
  const ld =
    e.startsAt && e.venueName && status !== "draft"
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: e.title,
          startDate: e.startsAt.toISOString(),
          ...(e.endsAt ? { endDate: e.endsAt.toISOString() } : {}),
          eventStatus: status === "cancelled" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: { "@type": "Place", name: e.venueName, address: e.venueAddress ?? e.venueName },
          description: e.summary ?? undefined,
          organizer: { "@type": "Organization", name: brand.name, url: brand.url },
        }
      : null;

  return (
    <PageShell
      eyebrow={`${e.edition ?? "Edition"} · ${EVENT_STATUS_LABEL[status]}`}
      title={e.title}
      lede={e.summary ?? undefined}
      actions={
        <>
          {status === "registration_open" && e.studentTicketsOpen && <LiquidButton href="/register/candidate" variant="primary" size="lg">Apply to pitch</LiquidButton>}
          {status === "registration_open" && e.audienceTicketsOpen && <LiquidButton href="/register/audience" size="lg">Audience tickets</LiquidButton>}
        </>
      }
    >
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />}
      {status === "cancelled" && <p role="status" className="mb-10 rounded-xl border border-[#e5484d]/50 bg-[#e5484d]/10 p-4">This event has been cancelled. See the <a className="underline" href="/refund-policy">refund policy</a>.</p>}
      <dl className="grid gap-px overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Date", date ?? "To be announced"],
          ["Time", formatEventTime(e.startsAt) ?? "To be announced"],
          ["Venue", e.venueName ? `${e.venueName}${e.venueAddress ? `, ${e.venueAddress}` : ""}` : "To be announced"],
          ["Capacity", e.showCapacity && e.capacity ? `${e.capacity} seats` : "Not published"],
        ].map(([k, v]) => (
          <div key={k} className="bg-[var(--bg)] p-6"><dt className="eyebrow">{k}</dt><dd className="mt-2 text-lg">{v}</dd></div>
        ))}
      </dl>
      {e.mapUrl && <p className="mt-4"><a className="underline underline-offset-4" href={e.mapUrl} target="_blank" rel="noopener noreferrer">Open map</a></p>}

      <div className="mt-20 grid gap-16 lg:grid-cols-2">
        <section aria-labelledby="ev-tix">
          <h2 id="ev-tix" className="display h-lg">Tickets</h2>
          <ul className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {([["candidate", e.studentTicketsOpen], ["audience", e.audienceTicketsOpen]] as const).map(([k, open]) => (
              <li key={k} className="flex items-center justify-between gap-4 py-5">
                <div><p className="display text-2xl">{pricing[k].label}</p><p className="text-sm text-[var(--fg-faint)]">Food included</p></div>
                <div className="text-right"><p className="display text-3xl">{formatINR(pricing[k].amount)}</p><ElasticPill tone={open && status === "registration_open" ? "live" : "neutral"}>{open && status === "registration_open" ? "Open" : "Not open"}</ElasticPill></div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-[var(--fg-faint)]">A pass does not guarantee selection, a pitching slot or an internship.</p>
        </section>
        <section aria-labelledby="ev-ind">
          <h2 id="ev-ind" className="display h-lg">Four industries</h2>
          <ul className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {industries.map((i) => <li key={i.slug}><a className="block py-4 hover:underline" href={`/industries/${i.slug}`}>{i.name}</a></li>)}
          </ul>
        </section>
      </div>

      {agenda.length > 0 && (
        <section className="mt-20" aria-labelledby="ev-ag">
          <h2 id="ev-ag" className="display h-lg">Agenda</h2>
          <ol className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">{agenda.map((a) => <li key={a.time + a.title} className="grid grid-cols-[7rem_1fr] gap-4 py-4"><span className="mono pt-1">{a.time}</span><span>{a.title}</span></li>)}</ol>
        </section>
      )}
      {rules.length > 0 && (
        <section className="mt-20" aria-labelledby="ev-rules">
          <h2 id="ev-rules" className="display h-lg">Rules</h2>
          <ul className="mt-6 list-disc pl-5 text-[var(--fg-dim)] leading-8">{rules.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
      )}
    </PageShell>
  );
}
