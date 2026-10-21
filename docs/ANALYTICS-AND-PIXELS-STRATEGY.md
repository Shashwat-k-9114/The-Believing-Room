# Analytics and marketing pixels: audit and approval checklist

Audit result (21 October 2026): **no analytics, tag manager or advertising pixel exists in the codebase**, and none was added. No measurement ID was invented. The Content Security Policy (`next.config.ts`) allows scripts only from the site and Razorpay Checkout, so a third-party tag would be blocked until the policy is deliberately changed.

## Recommendation

1. **Privacy notice first.** `/privacy` must describe analytics and advertising identifiers before either is enabled. Candidate data includes résumés and personal details, and the notice is incomplete today (conflict C-4 in the legal package).
2. **Consent before advertising pixels.** Meta Pixel (retargeting) should load only after an explicit opt-in and be a separate switch from analytics. Under India's Digital Personal Data Protection Act and Rules, notice and consent duties are phased in (the main duties were not yet in force on the sources checked: counsel to confirm the current dates).
3. **Analytics: GA4 only, and only after approval,** with a consent gate, Consent Mode defaulting to "denied", no Google Signals and short retention.
4. **Never send** application contents, names, emails, phone numbers, résumé data, ticket references, payment identifiers or free text to any analytics or advertising tool. Events should be coarse (for example "candidate_form_started") and carry no personal fields. URLs containing references (`/tickets/…`, `/pay/…`) must be excluded.
5. **Absence must be harmless.** Implement as environment-driven and off by default: `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID` and two explicit enable flags. If unset, render nothing and make no requests.

## Approval needed before enabling

- A founder decision on whether to track at all, and which of analytics versus advertising.
- Real GA4 and Meta Pixel IDs supplied by the founders (none exist in the repository).
- An updated privacy notice and, for advertising, a consent banner with equally prominent accept and reject.
- Counsel review of the notice and consent wording.
- CSP changes (add only the specific tag domains) and tests that tracking scripts do not load without consent and never load on `/admin`, `/pay` or `/tickets`.
- A decision on real-user performance data (Vercel Speed Insights is a lighter option) versus lab data.

Not implemented in this pass on purpose: the founders' note proposes both tools, but enabling them is a privacy and legal decision, not a coding one.
