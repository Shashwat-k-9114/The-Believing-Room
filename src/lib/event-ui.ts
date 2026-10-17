import type { EventStatus } from "@/config/site";

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  draft: "Draft",
  announced: "Announced",
  registration_open: "Registration open",
  registration_closed: "Registration closed",
  upcoming: "Upcoming",
  live: "Live now",
  completed: "Completed",
  cancelled: "Cancelled",
};

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(d);

export const formatEventDate = (d?: Date | null) => (d ? fmt(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : null);
export const formatEventTime = (d?: Date | null) => (d ? fmt(d, { hour: "numeric", minute: "2-digit", hour12: true }) + " IST" : null);
