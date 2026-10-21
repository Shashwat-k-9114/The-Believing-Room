import type { MetadataRoute } from "next";
import { brand } from "@/config/site";
import { isIndexable } from "@/lib/indexing";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/tickets/", "/pay/"] }],
    sitemap: `${brand.url}/sitemap.xml`,
  };
}
