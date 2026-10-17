import "server-only";
import { and, asc, desc, eq, inArray, lte, or, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { PUBLIC_EVENT_STATUSES } from "@/config/site";

/** Public visibility rule, defined once: published, or scheduled and due. */
function visible() {
  const { episodes } = schema;
  return or(
    eq(episodes.publication, "published"),
    and(eq(episodes.publication, "scheduled"), lte(episodes.publishAt, new Date())),
  );
}

export async function publicEpisodes(kind?: "episode" | "podcast" | "clip") {
  const db = await getDb();
  const { episodes } = schema;
  return db
    .select()
    .from(episodes)
    .where(kind ? and(visible(), eq(episodes.kind, kind)) : visible())
    .orderBy(desc(episodes.releaseDate), desc(episodes.createdAt));
}

export async function publicEpisode(slug: string) {
  const db = await getDb();
  const { episodes } = schema;
  const [row] = await db.select().from(episodes).where(and(eq(episodes.slug, slug), visible())).limit(1);
  return row ?? null;
}

export async function publicEvents() {
  const db = await getDb();
  const { events } = schema;
  return db
    .select()
    .from(events)
    .where(inArray(events.status, PUBLIC_EVENT_STATUSES))
    .orderBy(asc(events.startsAt));
}

export async function publicEvent(slug: string) {
  const db = await getDb();
  const { events } = schema;
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), inArray(events.status, PUBLIC_EVENT_STATUSES)))
    .limit(1);
  return row ?? null;
}

/** The event currently selling audience tickets, if any. */
export async function openAudienceEvent() {
  const db = await getDb();
  const { events } = schema;
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.status, "registration_open"), eq(events.audienceTicketsOpen, true)))
    .orderBy(asc(events.startsAt))
    .limit(1);
  return row ?? null;
}

/** Only panelists/partners that are confirmed AND published. */
export async function publicPanelists() {
  const db = await getDb();
  const { panelists } = schema;
  return db.select().from(panelists).where(and(eq(panelists.confirmed, true), eq(panelists.publication, "published")));
}

export async function publicPartners() {
  const db = await getDb();
  const { partners } = schema;
  return db.select().from(partners).where(and(eq(partners.verified, true), eq(partners.publication, "published")));
}

export { isNull };
