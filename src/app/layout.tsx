import type { Metadata, Viewport } from "next";
import { Cormorant, Hanken_Grotesk } from "next/font/google";
import { brand } from "@/config/site";
import { Footer } from "@/components/layout/Footer";
import { GlassNavigation } from "@/components/layout/GlassNavigation";
import "./globals.css";

const grotesk = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
// Display serif: Cormorant (SIL OFL). Used large only; body copy is always the grotesk.
const serif = Cormorant({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: `${brand.name}: ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: "en_IN",
    title: brand.name,
    description: brand.description,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#160f1c",
  colorScheme: "dark light",
};

/** Runs before first paint: marks JS availability (reveals) and weak devices (cheaper glass). */
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');
if((navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=2)d.classList.add('low-gfx');
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${grotesk.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">Skip to content</a>
        <GlassNavigation />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
