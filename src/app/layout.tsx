import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { brand } from "@/config/site";
import { Footer } from "@/components/layout/Footer";
import { GlassNavigation } from "@/components/layout/GlassNavigation";
import "./globals.css";

const grotesk = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
// Metadata-only face: never allowed to block text rendering or be preloaded.
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "optional", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: `${brand.name}: live internship pitching for students in India`, template: `%s · ${brand.name}` },
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
  themeColor: "#08090b",
  colorScheme: "dark light",
};

/**
 * Runs before first paint (blocking, tiny). Decides:
 *  - whether the hero intro plays (first visit to "/", motion allowed)
 *  - `js` flag for reveal fallbacks
 *  - `has-lens` on desktop Chromium (SVG refraction on signature surfaces)
 *  - `low-gfx` on weak devices (cheaper glass)
 */
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{if(!rm&&location.pathname==='/'&&!localStorage.getItem('arena-intro-v1')){d.setAttribute('data-intro','play');localStorage.setItem('arena-intro-v1','1')}}catch(e){}
var ua=navigator.userAgent;if(/Chrome\\//.test(ua)&&!/Mobile|Android/.test(ua))d.classList.add('has-lens');
if((navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=2)d.classList.add('low-gfx');
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${grotesk.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body suppressHydrationWarning>
        <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
          <defs>
            {/* Subtle lens: displaces the backdrop by a smooth noise map near edges. */}
            <filter id="lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="4" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <a href="#main" className="skip-link">Skip to content</a>
        <GlassNavigation />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
