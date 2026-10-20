# Implementation checklist — verification status

Last verified against the production build on 2026-10-20. Nothing here has been pushed, merged or deployed.

## Verified (tooling output, not assumption)
- `tsc --noEmit`, `eslint`, `vitest` (39 tests), `next build`: pass.
- Playwright (Chromium): 43/43 pass from an empty database, twice in a row (see "Fixed in this pass").
- axe WCAG 2.x A/AA on 12 pages x dark and light schemes: 0 violations.
- No horizontal overflow, no console errors on `/`, `/partners`, `/sponsors`, `/events`, `/the-show`, `/how-it-works` at 390 / 820 / 1440 px.
- Hamburger menu at 390 / 820 / 1440 px: opens by click, tap and keyboard (Enter); closes by Escape and by the Close button; focus returns to the
  hamburger after both; Tab/Shift+Tab never reaches the inert page (the one "outside" stop is the browser chrome, native `<dialog>` behaviour);
  Close button stays top-right inside the viewport; a link navigates and the dialog closes; no horizontal overflow. The sheet is full-screen, so there is no backdrop-click-to-close by design.
- `.glass { position: relative }` is declared in `@layer base`, so any Tailwind utility (`absolute`, `sticky`, `fixed`) overrides it. The five other
  `.glass` + positioned elements (price summary, tooltip, episode play badge, YouTube facade, modal close) were checked; no `!absolute` was needed anywhere.
- Reduced motion: no reveal stays hidden, no infinite animation runs.
- Public site contains no mention of the ₹65,000 advance, vendor quotation or internal negotiations (asserted by a test).

## Fixed in this pass
1. Light-theme secondary text (`--fg-dim`, `--fg-faint`) failed WCAG AA contrast on pearl backgrounds. Strengthened.
2. Mobile hero clipped "Opportunity" to "Opportunit" (the `h1` was capped at 9ch inside an `overflow:hidden` line mask). Fixed; checked at 10 widths 320-1920.
3. Mobile hero: ribbon art ran behind links and the pricing line. Art is now a quieter layer below `lg`; desktop unchanged.
4. Ten e2e tests were written for the v1 site (intro, arena tablist, `ARN-` refs, `/register/student`). Rewritten for the current site; new tests added for
   the confirmed ecosystem, partner wording, the menu dialog, and the sponsor enquiry (UI + API validation/origin).
5. e2e database persisted between runs, so tests depended on earlier runs. Now wiped at config load (not `globalSetup`, which runs after the server has opened the DB).

## Not verified / needs you
- Official logos: none are shown. They stay typographic until written permission for each is on file (`public/partners/`).
- Prospectus PDF: the "Request the prospectus" path only offers a download if a reviewed PDF exists at `public/prospectus/the-believing-room-sponsorship.pdf`.
- Real email delivery and Razorpay payments were exercised only in their "not configured" paths (honest fallbacks), not against live services.
- Browsers: Chromium only. Safari/Firefox and real touch devices are untested (touch was emulated).
- Lighthouse / performance budgets were not run in this pass.
- The original "Master Website Evolution Directive" was not visible to me in this conversation; I worked from your latest message and the code. If it contains
  requirements beyond those, send it and I will diff it against this list.
- The mobile hero no longer shows the sculpture prominently (copy fills the screen). A dedicated mobile composition would be a design decision for you.
