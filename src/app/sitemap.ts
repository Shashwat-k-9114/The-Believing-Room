import type { MetadataRoute } from "next";
import { brand } from "@/config/site";
import { industries } from "@/content/industries";
import { publicEpisodes, publicEvents } from "@/lib/content";

const STATIC = ["", "/about", "/how-it-works", "/industries", "/partners", "/sponsors", "/events", "/register/candidate", "/register/audience", "/for-recruiters", "/for-colleges", "/the-show", "/episodes", "/podcast", "/stories", "/faq", "/contact", "/links","/privacy", "/terms", "/refund-policy", "/media-consent"];

export default function sitemap(): MetadataRoute.Sitemap {
  const events = publicEvents();
  const eps = publicEpisodes();
  const abs = (p: string) => `${brand.url}${p}`;
  return [
    ...STATIC.map((p) => ({ url: abs(p || "/"), changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...industries.map((i) => ({ url: abs(`/industries/${i.slug}`), priority: 0.8 })),
    ...events.map((e) => ({ url: abs(`/events/${e.slug}`) })),
    ...eps.map((e) => ({ url: abs(`/episodes/${e.slug}`) })),
  ];
}
