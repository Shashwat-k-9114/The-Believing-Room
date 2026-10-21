import type { MetadataRoute } from "next";
import { brand } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: "Believing Room",
    description: brand.description,
    start_url: "/",
    display: "browser",
    background_color: "#160f1c",
    theme_color: "#160f1c",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
