import type { MetadataRoute } from "next";
import { brand } from "@/config/site";
import { industries } from "@/content/industries";
import { publicEpisodes, publicEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

const STATIC = ["", "/about", "/how-it-works", "/industries", "/partners", "/sponsors", "/events", "/register/candidate", "/register/audience", "/for-recruiters", "/for-colleges", "/the-show", "/episodes", "/podcast", "/stories", "/faq", "/contact", "/privacy", "/terms", "/refund-policy", "/media-consent"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, eps] = await Promise.all([publicEvents(), publicEpisodes()]);
  const abs = (p: string) => `${brand.url}${p}`;
  return [
    ...STATIC.map((p) => ({ url: abs(p || "/"), changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...industries.map((i) => ({ url: abs(`/industries/${i.slug}`), priority: 0.8 })),
    ...events.map((e) => ({ url: abs(`/events/${e.slug}`), lastModified: e.updatedAt })),
    ...eps.map((e) => ({ url: abs(`/episodes/${e.slug}`), lastModified: e.updatedAt })),
  ];
}
