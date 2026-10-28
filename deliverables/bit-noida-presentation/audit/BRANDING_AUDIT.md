# Branding audit (working document)

What was read in the repo, what was reused, and what was deliberately left out. No secrets, env values, admin data or candidate data were opened or copied (`.env.local`, `.data/` and the Google Sheets webhook were not read).

## Sources read
`src/app/globals.css`, `src/config/site.ts`, `src/content/industries.ts`, `src/app/page.tsx` and `components/sections/{Hero,Acts,ShowFlow,RibbonArt}.tsx`, `src/app/how-it-works`, `src/app/register/candidate`, `src/app/links`, `src/app/for-recruiters`, `docs/BRAND-ASSETS.md`, `brand-source/*`, `public/brand/*`.

## Visual system reused
| Token | Value | Where used in the deck |
|---|---|---|
| Aubergine / midnight | `#160F1C`, `#1E1626` | dark slide backgrounds |
| Ivory / pearl | `#F6F1E9`, `#EDE6DA` | light slides (2, 7), text on dark |
| Champagne / gold | `#E3CFA8`, `#CBAE76`, `#A98A4F` | accents, numerals, ribbons, rules |
| Lavender | `#B7A9C4` | secondary text, ribbons |
| Industry accents | `#B7A9C4`, `#CBAE76`, `#D9B7A6`, `#9C86B0` | the four arches on slide 5 |
| Motifs | arch doorway, silk ribbon (`RibbonArt.tsx`), stage spotlight | arches (5, 8), ribbons (every slide, Morph objects), cone and halos (1, 3, 4) |
| Voice | "Your Talent. Your Stage. Your Opportunity." (site hero); industry taglines from `industries.ts` | slides 1 and 5 |

The site renders type in Space Grotesk and DM Sans. The deck uses Georgia, Cambria (numerals) and Calibri so it renders the same on any Windows or Mac machine with Office. Static cuts of the two brand fonts are in `fonts/static/` (OFL) for anyone who wants to install them and change the three font constants at the top of `src/build_deck.py`.

## Logo and imagery (all from the repo, unaltered except as noted)
| Asset | Source | Used on |
|---|---|---|
| Banner (logo lock-up: B emblem + wordmark on stage) | `brand-source/linkedin-banner-tbr.png` | slide 1 (feathered into the background with PowerPoint soft-edge; no recolouring) |
| Emblem (golden B) | `brand-source/Show_DP.png` | slide 8 (arch crop), slide 9 (circle crop) |
| Wordmark | `public/brand/show-wordmark-1408.jpg` | bundled in `assets/` but not placed on a slide |

Aspect ratios are preserved on all three. No logo was redrawn or approximated.

## Not used, on purpose
- BIT Noida logo or marks: none supplied, no permission established.
- Recruiter names or logos: `public/partners/` is empty and the repo names none.
- Fees or ticket prices: the repo's price fixtures changed recently and the brief says not to show outdated fees.
- Participant counts, `season.planned` figures (40 candidate places etc.): planned numbers, not confirmed.
- Stock photos: none.

## Discrepancies found (worth a decision before the talk)
1. **16 recruiters.** `src/config/site.ts` still calls 16 a "target set by the organiser". The brief says 16 are now secured, and the deck says "16 recruiters secured". The website has not been updated (and was not touched).
2. **Tagline.** The banner artwork says "Where Talent Meets Opportunity"; `brand.tagline` in the site config is "Where Opportunity Meets Belief." Slide 1 shows the banner as supplied; slide 9 uses the site's line.
3. **Industry name.** The site says "Finance & Accounting"; the brief and deck say "Finance".
4. **Artwork rights.** `docs/BRAND-ASSETS.md` §2 records that the emblem and wordmark look machine-generated and that ownership and licence terms are not established. That is a pre-existing open question for the founders, and it applies to the deck as it does to the site.
