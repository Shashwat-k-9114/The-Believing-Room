# Brand assets: inventory, mapping and usage

Pass date: 21 October 2026. Originals are preserved byte-for-byte (SHA-256 checked when moved) in `brand-source/` and `docs/source/`. Everything under `public/brand/` and the icon files in `src/app/` is generated from them by `scripts/build-brand-assets.py` (needs Pillow). Do not edit generated files by hand.

## 1. What was supplied and what was inspected

| File | Now at | Opened and inspected | Findings |
|---|---|---|---|
| `Show_DP.png` | `brand-source/Show_DP.png` | Yes | 2048 x 2048, RGBA but fully opaque (no transparent background). 6.8 MB. A golden B with a hand making a V sign, a necktie and a microphone, on a purple stage with spotlights. Very detailed: unreadable below roughly 128 px. Contains no text. Centre-weighted, so it survives a circular crop. |
| `Show.jpeg` | `brand-source/Show.jpeg` | Yes | 1408 x 768 JPEG. Lettering "The Believing Room" with a necktie as one "i" and a microphone as another, on a purple stage. The text is baked into the image. A small four-point sparkle (an image-tool mark) sits at bottom right. |
| `New Microsoft Word Document.docx` | `docs/source/Founder-requirements-note.docx` | Yes, every paragraph | A Hinglish growth checklist (brand recall, UI/UX, marketing) plus three one-line requests at the end: a 20% refund charge for ineligible candidates, an SEO-friendly site, and a registration and payment backend. No images inside. |

Resolution limits: nothing is upscaled. The largest derived emblem is 1024 px (source 2048). The largest wordmark is 1408 px (the source width).

## 2. Licensing and ownership: NOT established

Both images look machine-generated, and `Show.jpeg` carried an image-tool mark. I have no evidence of who owns them, which tool made them, or whether that tool's terms permit commercial use or trademark registration. This is a founder decision: confirm provenance and rights before using the artwork beyond the website, and before registering the B or the wordmark as a trademark. I retouched the tool mark out of the derived wordmark image only; the original is untouched. If the tool's terms require its mark to stay, restore it by rebuilding from the original without the retouch step.

## 3. Brand hierarchy implemented

| Layer | Asset | Where it appears |
|---|---|---|
| Primary website identity | Existing editorial typography (Cormorant display, Hanken Grotesk body), ivory / aubergine / champagne, sculpture ribbons | Unchanged. Headings stay real HTML text. |
| Small-icon identity | Simplified gold B on aubergine (`src/app/icon.svg`, `apple-icon.png`, `favicon.ico`, `public/brand/icon-*.png`, `b-mark.svg`) | Browser tab, home-screen icon, header lock-up (replaces the small arch beside the name), very faint footer watermark |
| Show/media identity | `Show_DP` emblem and `Show` wordmark artwork | The Show page, in a single "The stage" section where the detail can be seen. The emblem is also in the social-share image |
| Social identity | `public/brand/show-emblem-1024.jpg` | Ready to use as a profile picture (centre-safe for circles). Not uploaded anywhere by me |

The arch motif remains in the footer lock-up and in the home page acts; it is the hero's doorway and is not retired.

Deliberately not done: the full square artwork was not pasted into other sections; no badge sits beside headings; the wordmark image does not replace the navigation wordmark; no image with baked-in text sits behind duplicate HTML text. The podcast page does not use the show artwork because the podcast title is still provisional.

## 4. Generated files

- `public/brand/show-emblem-{640,1024}.{webp,jpg}` (40 KB and 89 KB WebP) and `show-wordmark-{704,1408}.{webp,jpg}` (25 KB and 74 KB WebP). JPEG fallbacks are included. WebP suits this photographic-style artwork; PNG would be several MB, and AVIF was not needed to reach these sizes.
- `src/app/icon.svg`, `apple-icon.png` (180), `favicon.ico` (16/32/48), `public/brand/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (B at 72% inside the safe zone), and `src/app/manifest.ts`.
- `src/lib/og-emblem.ts`: a 29 KB data URI used by `src/app/opengraph-image.tsx` and `twitter-image.tsx`. The title in the social image is live text, large and high contrast.
- Small-size check: the B was rendered at 16, 32, 48, 64, 96 and 128 px and inspected; it stays recognisable at 16 px.

## 5. Regenerating

`python scripts/build-brand-assets.py`. A stale Turbopack cache once hid new CSS during a local build. If styles look missing after editing `globals.css`, delete `.next` and rebuild. Vercel builds from clean.
