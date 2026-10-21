# Brand integration and requirements pass: report

Date: 21 October 2026. Branch `believing-room-redesign`. Local commit only: nothing was pushed or deployed, and no production DNS, database or payment setting was touched. Companion documents: `BRAND-ASSETS.md`, `FOUNDER-DECISION-20PERCENT-REFUND-PROPOSAL.md`, `ANALYTICS-AND-PIXELS-STRATEGY.md`.

## 1. Requirements reconciliation (founders' note and the directive)

| Request | Status | What was done or why not |
|---|---|---|
| Sharp custom favicon with a B | **Implemented** | Simplified gold B (not the busy stage art). SVG, ICO 16/32/48, Apple touch 180, manifest icons 192/512 and maskable 512. Checked down to 16 px. |
| Sticky header that shrinks, B always visible at left | **Already existed, refined** | The fixed glass header already narrows on scroll with no layout shift. The B mark now leads the lock-up. Menu, focus trap, Escape and focus return were kept and are tested. |
| Logo hover micro-interaction | **Implemented** | A 6 degree tilt with a faint gold glow on hover and keyboard focus. None under reduced motion (tested). |
| 60-30-10 colour rule | **Principle adopted, no change** | The existing palette already follows it. Neon green or electric amber were rejected as off-brand. |
| Footer B watermark and mission line | **Implemented** | The simplified B at about 5% opacity behind the footer, decorative and click-through, far below any contrast concern (tested). The mission line "Where Opportunity Meets Belief." was already in the footer. |
| Crisp above-the-fold message | **Implemented** | The hero lede now says what it is, who it is for and what it is not: "a live internship-pitching show. Students present their skills, projects and potential directly to industry professionals". The brand headline and calls to action are unchanged. A line states "Not a job board, and no placement is promised." The generic "Transform Your Vision into Reality" was rejected. |
| Glass depth, scroll reveals, button feedback | **Already existed** | Restrained glass, the existing Reveal observer (content visible without JS or IntersectionObserver) and instant button states were kept. No new animation library. |
| Interactive FAQ | **Already existed** | `/faq` already has an interactive accordion in five groups (Basics, Money, Selection, Filming, Partners). Separate recruiter-only and sponsor-only FAQ sets were not added; the Partners group covers both for now. The FAQ repeats the "fees are non-refundable" wording, so it is part of the refund-policy conflict in the 20% decision document. |
| Pricing calculator | **Rejected** | Irrelevant to this venture. |
| Short lead form (name plus WhatsApp) | **Partly implemented** | Sponsor enquiry reduced from six required fields to five (organisation, contact, email, category and interest; role, phone and budget are now optional and grouped separately). Server validation, storage, rate limiting, consent and honest receipt text are unchanged. Name plus WhatsApp alone was rejected: it cannot distinguish a genuine sponsor. |
| Floating WhatsApp button | **Deferred** | No founder-approved business number exists, and none was invented. Add it when one is supplied. It must be subtle and never cover forms or the mobile menu. |
| Social-proof marquee ("Trusted by 500+…") | **Rejected** | No verified figures exist. The existing static, typographic ecosystem presentation (recruitment participants, Futured, Amity and BIT Noida in separate roles, no logos without permission) stays. |
| GA4 and Meta Pixel | **Deferred, strategy written** | Nothing exists in code; see `ANALYTICS-AND-PIXELS-STRATEGY.md` for the approvals needed. |
| Mobile load under 1.5 s | **Not achieved; not claimed** | Measured below. |
| WebP images | **Implemented where it helps** | New artwork ships as WebP with JPEG fallback, plus responsive sizes. |
| SEO-friendly site | **Improved** | See section 3. |
| 20% refund charge | **Not implemented; decision register entry written** | See `FOUNDER-DECISION-20PERCENT-REFUND-PROPOSAL.md`. |
| Registration form and payment backend | **Already existed; payments stay off** | See section 4. |

## 2. Brand integration

- **Show page** gains one section, "The stage", showing the supplied wordmark artwork and the B emblem large enough to be read, each with real alt text and fixed dimensions (no layout shift) and lazy loading. The explanatory text is real HTML.
- **Header** lock-up uses the B mark beside the typographic name. The elegant typographic identity remains primary.
- **Social preview** (`/opengraph-image`, `/twitter-image`) now pairs live, large title text with the emblem.
- **Not used:** the artwork was not pasted into other sections, not placed beside headings, and the wordmark image does not replace the navigation wordmark.
- **Licensing of both images is unconfirmed** (see `BRAND-ASSETS.md`, section 2). That is a founder decision before any wider use.
- Screenshots of the result are in `docs/acceptance/brand-*.png`.

## 3. SEO and sharing

Existing and verified: unique titles and canonicals per page, a sitemap, robots rules, one h1 on every public route (tested). Added: the Organization structured data (name, URL, logo, social profiles only; no events, dates, ratings or counts), a web manifest, a Twitter image, `/pay/` disallowed in robots, and a **preview gate**: robots and the page robots meta become "noindex, disallow all" on any Vercel deployment whose `VERCEL_ENV` is not production (unit tested). Not done: structured Event data (no confirmed dates exist). Risk to check at deploy time: set `NEXT_PUBLIC_SITE_URL` in production, or canonical and social URLs fall back to localhost.

## 4. Registration and payment audit (what I verified this pass versus earlier)

Verified this pass by the passing browser suite: candidate flow validation and persistence, server rejection of bad input and fake PDFs, wrong origins, unsigned webhooks, forged checkout signatures, rate limits, admin closed to anonymous users, resume download behind the session, ticket pages leaking nothing, audience tickets unavailable rather than faked, prospectus gated by approval. Verified in code this pass: payment collection needs provider keys and `PAYMENTS_ENABLED=true`; the candidate pay route accepts only shortlisted applications.

Not re-audited line by line this pass, and relying on the previous reports (`ACCEPTANCE-REPORT.md`): idempotent webhook handling, refund records, audit logs, reconciliation. **No payment has ever run against a live provider**, so webhook and reconciliation behaviour is unproven outside tests. Email is not configured, so no notification is sent and the site says so honestly. Open: the production database. The site uses an embedded database locally; real applications need the Postgres `DATABASE_URL` configured and migrations applied before launch.

## 5. Mobile performance (lab only, not real-user)

Production build, Lighthouse 12.8.2 mobile defaults (simulated throttling), this machine (memory-constrained, results vary), 3 runs for home:

| Page | Performance | LCP | TBT | CLS |
|---|---|---|---|---|
| Home | 77, 65, 74 | 3.4, 3.6, 3.5 s | 410, 1100, 510 ms | 0 |
| Sponsors | 91 | 3.3 s | 130 ms | 0 |
| The Show (new artwork section) | 87 | 3.6 s | 180 ms | 0 |

Accessibility 100, best practices 100 and SEO 100 on all five runs. The home range matches the earlier baseline (69 to 80, LCP 3.2 to 3.7 s), so this pass did not move it. On home the LCP element is the header wordmark text, which suggests the web-font swap rather than any image; I did not change font loading. The new artwork is lazy, small and dimensioned, and it does not appear in the home page load. The under-1.5-second target is **not met and not claimed**. A fix to try next is the font strategy and the first-paint cost of the hero animation, tested on a real phone.

## 6. Tests

| Gate | Result |
|---|---|
| TypeScript | clean |
| ESLint | clean |
| Unit tests | 61 of 61 (one new file for the preview-indexing gate) |
| Production build | succeeds (from a clean `.next`) |
| Playwright, Chromium + Firefox + WebKit | **78 of 78**: the previous 69 plus 9 new regression tests (icons and social images served with correct types, head tags and factual structured data, header B link plus menu focus, reduced-motion logo, show artwork loading with alt text and no phone overflow, faint decorative footer watermark, hero message, reduced sponsor form field set, robots) |
| Axe accessibility suite | passes inside the 78 |

Lighthouse accessibility, SEO and best-practices all scored 100 in the runs above. The regression for scroll-to-form on the sponsor page remains in the suite and passes.

## 7. Founder decisions required

1. The 20% charge (and, with it, when the candidate fee is collected, the definition of "not eligible", gateway-fee treatment). Final refund policy in general.
2. Ownership and permitted use of the two supplied images, and the retouched tool mark.
3. A founder-approved WhatsApp business number (or confirmation that none should be shown).
4. Whether to enable analytics or advertising pixels at all, and the IDs.
5. Whether to use the B emblem as the social profile picture on each channel.
6. The podcast's final title, before any podcast artwork is made.

## 8. Vercel-readiness verdict

**Not ready to launch. Ready for a protected preview deployment.** The code builds, passes every gate above, preview deployments are now excluded from indexing, and payments, the prospectus and tracking are all off by default. Before a production launch: set `NEXT_PUBLIC_SITE_URL`, a durable Postgres `DATABASE_URL` with migrations applied, admin credentials and session secrets, a durable rate-limit store (the current limiter is in memory and so is per instance on serverless), and keep `PAYMENTS_ENABLED` unset. Decisions 1 and 2 above, the legal review of the seven agreements, and the privacy notice are launch blockers. Mobile performance is acceptable for a preview but below the founders' stated target.
