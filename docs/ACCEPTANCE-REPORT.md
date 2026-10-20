# The Believing Room: visual and functional acceptance report

Baseline: `c4355a3` (tag `acceptance-baseline`). Nothing here has been pushed, merged or deployed.
Evidence is from the production build, driven in Chromium, Firefox and WebKit, plus Lighthouse 12.8.2.
Severity: **P0** launch blocker, **P1** important production issue, **P2** polish or quality.

## 1. Verdict

The site is coherent, honest and well art-directed. It is **not** ready for a public launch that takes money, and the
reasons are mostly outside the code: legal review, written logo permissions, a final prospectus, a configured mail
provider and a verified payment provider. Within the code, this pass found and fixed five real defects that earlier
automated checks had not caught (section 4), and left one unresolved performance problem on slow mobile (section 9).

**Release-readiness status (final pass).** Engineering gates are green on the final code: TypeScript, ESLint, 60/60 unit tests, production build, and 69/69 Playwright tests across Chromium, Firefox and WebKit (section 9). Nothing is "certified": physical-device, Safari-on-Apple-hardware, screen-reader, legal and penetration testing were not performed. Open items by severity are in section 10; the admin review is section 14.

## 2. Route-by-route review

Reviewed at 1440 / 820 / 390 px, with scrolled screenshots, contact sheets at full resolution where something looked off,
and an in-browser audit of every route at three widths (overflow, clipping, tiny text, undersized touch targets, missing
image dimensions, heading structure, console and network errors).

| Route | Assessment | Action |
|---|---|---|
| `/` | Strongest page. Ribbon hero, ivory/aubergine rhythm, wave transitions that vary in shape, philosophy → process → disciplines → place → show → ecosystem → education → close. | Mobile hero recomposed (section 5). |
| `/partners` | Honest and accurate, but the four recruiters were a plain list repeating the same sentence four times, set small. The page that should be most credible was the flattest. | Shared role stated once; recruiters now set as plates with a fixed-height logo slot. |
| `/sponsors` | Honest and complete, but a decision-maker had to scroll ~600px to see who is involved, and ~8,400px of near-identical ruled sections. | At-a-glance strip added (format, four industries, confirmed recruiters, what is produced, target window). |
| `/events` | Clean and truthful. A table of facts, no invented date. | Target window row added (labelled "a target, not a confirmed date"). |
| `/register/candidate` | Clear four-step form; consent well separated. Had a real bug (section 4). | Fixed. |
| `/register/audience` | Honest "not on sale" state with price summary. No fake checkout. | None. |
| `/industries`, `/industries/*` | Distinct line mark per discipline; consistent, readable structure. Roles labelled as illustrative, not vacancies. | None. |
| `/the-show`, `/episodes`, `/podcast` | Truthful pre-launch states, no invented counts. But the three pages looked identical, and the header was text on a flat field. | Header sculpture added (below). Distinct identity needs real content (section 12). |
| `/how-it-works`, `/about`, `/stories`, `/faq`, `/contact` | Consistent and readable. `/about` uses one AI-generated image, honestly captioned "conceptual imagery, not footage". | See section 12. |
| `/for-recruiters`, `/for-colleges` | Benefit list beside a working enquiry form; "what we won't promise" stated. | None. |
| `/privacy`, `/terms`, `/refund-policy`, `/media-consent` | Readable. **Leaked internal drafting notes** (section 4). | Fixed; content still needs legal review (section 10). |
| 404 | On-brand, links home. | None. |

Objective audit result, all 26 routes at 3 widths: no horizontal overflow, no clipped text, no sub-11.5px text, no
images without dimensions, exactly one `h1` per page, no console errors. The only 404 response is the deliberate not-found page.

## 3. Major strengths

- A real point of view: serif display type with italic accents, restrained palette (ivory, champagne, midnight aubergine, muted lavender), generous negative space, hairlines instead of cards. It does not read as templated.
- Truthfulness is built into the product: no countdown, no fake episodes, counts or testimonials; partner roles stated per category with what each is **not** (not sponsorship, not endorsement); no guaranteed-internship language anywhere (grep of the codebase finds only negations).
- Accessibility is genuinely clean: 24 axe checks (12 pages, dark and light) with zero violations; Lighthouse accessibility 100 on all pages tested.
- CLS is 0.000 on every page, every run.
- Reduced motion is honoured: nothing stays hidden, no infinite animation runs.
- Consent is properly separated: participation terms and privacy notice are mandatory; recording, publishing, name-and-college and promotional clips are four separate, unticked, optional choices, with the statement that declining never affects selection.

## 4. Defects found and fixed in this pass

| # | Sev | Defect | Evidence | Fix |
|---|---|---|---|---|
| 1 | P1 | **"Continue" on the last-but-one candidate step submitted the form.** The Continue and Submit buttons were the same React element in the same position, so the click re-rendered it as `type=submit` before the browser's default action ran. Arrival at the consent step showed premature red errors; a pre-ticked box would have submitted without the candidate seeing the step. | Reproduced; new test fails with the fix removed (2 premature alerts) and passes with it. | Distinct `key`s on the two buttons. |
| 2 | P1 | **Internal drafting notes were public.** `/terms` printed "Pending owner decision" boxes ("The source implies…", "Default in this build…", "counsel should confirm"); all four legal pages carried banners written in internal language ("this build", "the original page"). | Page text scan. | Notes no longer rendered (kept in `content/policies.ts` for the organiser); banners rewritten for visitors. New test scans every public route for internal wording and the confidential figures. |
| 3 | P1 | **Prospectus had no approval gate.** Any file dropped at the public path would publish instantly. | Code review. | Moved out of `public/` to `private/prospectus/`; served only by `/sponsors/prospectus`, only while the organiser has ticked "reviewed and externally approved" and the file is a real PDF. Tested in all four states (unapproved, approved, not a PDF, missing). |
| 4 | P1 | **Destructive e2e database reset was unguarded** (unconditional delete of a hard-coded path; the server under test would silently use any `DATABASE_URL`). | Code review. | See section 8. |
| 5 | P1 | **WebKit/Safari: focus did not return to the hamburger after closing the menu.** Safari does not focus a clicked button, so "remember the focused element" captured `<body>`. | Cross-browser test failed on WebKit only. | The opener is passed explicitly to the modal. |
| 6 | P2 | Footer, social and inline text links were ~20px tall on every page. | Audit, every route. | Hit-area padding on `.link-u` (no layout shift); header wordmark made 44px. |
| 7 | P2 | Inner-page header gradient ended in a visible hard-edged band; headers carried none of the homepage's identity. | Visual review. | Gradient fades to the page colour; quiet static ribbon fragment (wide screens only); wave divider into light bodies, as on the homepage. |
| 8 | P2 | Mobile recruiter plates kept their desktop height (large empty gaps). | Mobile review. | Height only from `sm` up. |

Also caught and corrected before shipping: my own at-a-glance copy lower-cased "November"; a `content-visibility` experiment that broke the primary CTA (section 9).

## 5. Mobile art direction

Before: the desktop sculpture sat behind the copy and was dimmed to stay readable, so on a phone it was effectively gone.
After: one composition per breakpoint. On wide screens the sculpture bleeds behind the copy at right (unchanged). On narrow
screens the copy comes first, then the sculpture as its own full-bleed band between the primary actions and the secondary links, then the
pricing line. It is fully visible and never under text. It is the same SVG instance repositioned by CSS (duplicating it would duplicate gradient IDs and break
rendering), fades into the background with a transparency mask rather than a colour (a coloured fade produced a visible seam, which I caught and removed), reserves its height
(no layout shift) and does not animate under reduced motion. Checked at 320, 360, 390, 430, 600, 768, 1024, 1280, 1440 and 1920px: no clipping.

## 6. Partnership ecosystem

Roles remain distinct on both the homepage and `/partners`: Recruitment participants (Manacle, KRVVY, Immverse AI, Galvanic), Educational contribution
(Futured Innovation Studios), Venue facilities (Amity Greater Noida), Student outreach (BIT Noida). Each category states what the relationship is not.
No logos are shown. `OrgMark` renders an approved logo only when permission is recorded as `approved` **and** a path is set, falls back to type if the file fails to load, and the
plate's logo slot has a fixed height so an authorised logo replaces the typeset name without moving anything. Participation is "confirmed by the organiser"; nothing implies funding or endorsement.

## 7. Sponsorship conversion and enquiry verification

A decision-maker now gets, in the first screen after the header: the format, the four industries, the confirmed recruiters, what is produced and the target window; then
why partner, five proposed formats ("proposed inventory, not promises"), the room/making distinction, and the form. Both CTAs land the form at exactly 112px from the top on phone and desktop (tested, all three browsers).

Persistence is proven, not simulated: enquiries submitted through the public form in Chromium, Firefox and WebKit appear (reference `TBR-S-…`, email, status) in the organiser's Sponsorship tab. Because mail is not configured here, the confirmation says
"We have not been able to send an automatic receipt, so please keep this reference" and a test asserts it does **not** say a receipt was emailed. The API rejects missing consent (422) and foreign origins (403).
No confidential vendor advance figure, quotation or private cash-flow detail appears anywhere in the public site (asserted on every route).

## 8. Database reset safety

The suite previously deleted `.data/pglite-e2e` unconditionally. Now:

1. `tests/e2e/isolation.ts` must **prove** a disposable target before anything is deleted, and otherwise throws and deletes nothing: refuses if any of `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_URL*`, `POSTGRES_PRISMA_URL` is set; refuses hosted environments (`VERCEL_*`, `RAILWAY_*`, `RENDER`, `FLY_APP_NAME`) and `NODE_ENV=production`; requires a direct child of `.data/` named `pglite-e2e*`; refuses symlinks and junctions; refuses a non-empty directory that is not recognisably a PGlite database or one the suite marked with a sentinel file.
2. The e2e server is started with DB variables **blanked** and `TBR_TEST_DB=1`, and `src/db/client.ts` refuses to start in that mode unless the database is `.data/pglite-e2e*` (or in-memory) with no `DATABASE_URL`. The suite also never loads DB variables from `.env.local`.
3. 19 unit tests cover the guard. Empirically verified: a shell `DATABASE_URL` aborts the run and a canary file survived; a poisoned `.env.production.local` did not reach the server (tests ran on the disposable DB); a test-mode server given a real-looking URL returned 500 "Refusing to start"; a test-mode server pointed at the dev database did the same.

Remaining limit: the guard protects this repository's own suite. Nothing can stop someone running an unrelated destructive command by hand.

## 9. Browser, accessibility and performance verification

**Browsers.** Chromium runs the full suite. Firefox and WebKit run the browser-sensitive spec (native-dialog menu, focus, forms, reduced motion, 375px layout, hero clipping from 320 to 1920px, CTA scrolling, prospectus gate). Real physical devices were not available; touch was emulated.

**Final verification run (release-readiness pass), on the committed code:**

| Gate | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | exit 0 |
| ESLint | `npx eslint src tests` and `npx eslint .` | exit 0, no warnings |
| Unit tests | `npx vitest run` | 5 files, **60/60 passed** (includes 19 DB-isolation tests and the new rate-limit tests) |
| Production build | `npx next build` | exit 0, all routes compiled |
| Playwright, all projects | `npx playwright test` | **69/69 passed** (8.7 min): chromium-desktop 53 (full suite, includes 24 axe checks), firefox 8, webkit 8 (cross-browser spec) |
| Integration tests | none configured separately | the Playwright suite exercises the real API and database end to end |
| Secret scanning | no scanner installed in the repo | manual check, see section 14 |

The earlier 67/2 result (two failures from my own over-strict assertion) is superseded by this clean run; no assertion was weakened. Before the run I confirmed the database reset target: no `DATABASE_URL`/`POSTGRES_*` variable in the shell or `.env.local`, target `.data/pglite-e2e`, guard unit-tested.

**Lighthouse 12.8.2, production build.** Desktop, 1 run each: performance 99, 99, 99, 99, 100 (home, partners, sponsors, candidate, show); LCP 660–735 ms; TBT 11–39 ms; CLS 0.000. Mobile, Lighthouse's simulated slow-4G / 4× CPU, 3 runs each:

| Page | Perf (runs) | LCP (runs) | TBT (runs) | FCP | CLS |
|---|---|---|---|---|---|
| Home | 80 / 83 / 74 | 3.57–3.69 s | 233–448 ms | 1.1 s | 0 |
| Partners | 79 / 78 / 79 | 3.58–3.62 s | 355–375 ms | 1.1 s | 0 |
| Sponsors | 82 / 86 / 79 | 3.39–3.44 s | 236–380 ms | 1.2–1.4 s | 0 |
| Candidate | 80 / 78 / 62 | 3.52–4.08 s | 403–1107 ms | 1.1–1.4 s | 0 |
| Show | 87 / 80 / 85 | 3.24–3.34 s | 249–365 ms | 1.1–1.2 s | 0 |

Accessibility 100, SEO 100 and best practices 96–100 on all five pages in the earlier Lighthouse pass (before the header, partner-plate and sponsor-strip changes); on the final build I extracted only the performance metrics above, and the axe suite (24 checks, zero violations) is the accessibility evidence for the final build.

**Finding (P1): mobile LCP is above the 2.5 s "good" threshold on every page, and TBT is high on the candidate page.** With Lighthouse's *applied* throttling (a genuinely slowed browser) I measured FCP 2.2–2.7 s, LCP 3.1–4.4 s, TBT 0.8–1.6 s, performance 56–69 on home, sponsors and candidate. What I established:
- The LCP element is the header wordmark text, and ~87% of LCP is render delay, not network. Observed (unthrottled) LCP equalled FCP at 0.8–2.7 s; the 3.3 s figure is Lantern's pessimistic projection.
- Main-thread cost is Layout/Style (~0.7 s at 4× CPU) and script evaluation (~0.4–0.9 s). A controlled experiment injecting `text-wrap: wrap`, no `backdrop-filter`, no filters and no animations changed layout cost by no more than noise, so those are **not** the cause.
- Only the homepage uses `content-visibility: auto`. I applied it to inner pages and it cut layout work, but it **broke the primary CTA**: on a phone, "Start a conversation" landed 3,184px short of the form. I reverted it and added a permanent test for CTA scrolling. A safe version needs the anchor targets handled explicitly.
- The candidate page's TBT varies 2–4× between identical runs; treat its single bad run as noise plus a real hydration cost for the multi-step form.

**Re-investigation in the release-readiness pass** (production build, Pixel 5 emulation, 4× CPU throttle, Chrome's own `LayoutDuration`/`RecalcStyleDuration`, 7 runs each, medians). Baseline mobile Lighthouse on this build: home 80/72/73, sponsors 76/69/80 (LCP 3.2–3.7 s, TBT 0.37–0.96 s); results vary run to run on this machine.

| Experiment (home page) | Layout | Style |
|---|---|---|
| Baseline | 399–457 ms | 313–335 ms |
| Hero art removed (`.hero-art{display:none}`) | 554 ms | 359 ms |
| All SVG removed | 410 ms | 313 ms |
| `content-visibility` disabled | **909 ms** | 423 ms |
| Sponsors page (no `content-visibility`) | **757 ms** | 199 ms |

Conclusions: the hero artwork is **not** the cause (removing it does not help); fonts are self-hosted and preloaded via the `Link` header; the JS is small (about 190 KB compressed over nine chunks, mostly the framework); HTML is 26 KB gzipped; CLS is 0. The cost is plain layout of a long text-heavy page. `content-visibility` genuinely halves it on the home page, and the inner pages would gain roughly 350 ms at 4× CPU, but the same technique broke the CTA scroll on inner pages. **No performance code was changed**, because no safe, proven improvement exists yet. Recommendation in section 12.

## 10. Production readiness blockers and external approvals

| Sev | Item | Owner |
|---|---|---|
| P0 | **Legal review** of terms, privacy, refunds and media consent before any payment is taken. Public banners say they are being finalised. | Organiser / counsel |
| P0 | **Terms conflict with the live flow.** `/terms` "Seat lock" says registration is complete only after payment and "No refunds" says all fees are non-refundable, while the site says applying is free and the ticket is requested after shortlisting, and has a separate refund-and-transfer page. The organiser must decide which is true. I did not edit legal wording. Contradictions and proposed wording: `docs/FOUNDER-DECISION-PAYMENTS-AND-TERMS.md`. | Organiser / counsel |
| P0 | **Payments are off** (correctly) and now fail closed: collection needs the provider keys **and** `PAYMENTS_ENABLED=true`; candidate pay returns 503 and audience tickets show "not on sale" otherwise. Do not enable until the provider is verified and the terms are final. | Organiser |
| P1 | **Multi-user authentication is absent: a production requirement.** Admin is one shared password with no per-person accounts, roles or MFA, and it exposes student personal data. Acceptable for one trusted organiser on a closed preview; required before operating live recruitment workflows (section 14). | Engineering |
| P1 | **Mail not configured.** Receipts and organiser notifications are not sent; the site says so honestly. Enquiries are stored and visible in the admin, but someone must check it. | Organiser |
| P1 | **Logo permissions:** none on file; all partners are typographic. Add written permission, set the path and tick "approved" per organisation. | Each partner |
| P1 | **Prospectus:** none exists. Place the final externally approved PDF in `private/prospectus/`, then tick approval in Settings. | Organiser |
| P1 | **Mobile performance** (section 9). | Engineering |
| P1 | **Event date and venue** are unconfirmed; only a labelled target window ("First week of November") is shown, editable or clearable in Settings. | Organiser |
| P2 | Real browsers on physical phones, Safari on macOS/iOS, and a screen reader pass were not done. | QA |

## 11. Content management: what is actually implemented

All of the following are database-backed and editable in `/admin` behind a signed session, with an audit log. None is static TypeScript.

| Requirement | Status |
|---|---|
| Organisations (category, role, description, website, confirmation status, evidence reference, announcement approval, publication, sort order) | Implemented |
| Logo permission and public asset visibility | Implemented as `none/pending/approved` plus a path; a logo renders only when approved. **Gap:** the file itself is placed in `public/partners/` and deployed, not uploaded in the admin |
| Internship opportunities (role, openings, stipend, location, duration, mode, eligibility, process, company approval, publication) | Implemented; nothing is public until marked approved by the company |
| Educational contributions (course, eligibility, period, certificate terms, quantity, terms confirmed, publication) | Implemented |
| Event editions and schedules | Implemented (events tab) |
| Sponsorship packages (summary, deliverables, approved public price, publication) | Implemented |
| Sponsor enquiries (status, internal notes) | Implemented, end-to-end tested |
| Episodes and podcast (one table, `kind` = episode / podcast / clip; slug, summary, guests, transcript, YouTube/Spotify, tags, related) | Implemented |
| Publication status including scheduled | Implemented; "scheduled" becomes public when `publishAt` passes, evaluated per request, no cron needed |
| Panelists, season phase, public target window, prospectus approval | Implemented |
| Gaps | Single shared organiser password (no per-user accounts or roles); thumbnails are a URL field (YouTube thumbnails are derived automatically); no file upload for logos or the prospectus; no versioned drafts or preview-before-publish |

## 12. Recommendations (priority order)

1. **Fix mobile performance safely (P1).** Layout of long pages is the measured bottleneck (section 9). Make `content-visibility: auto` anchor-aware (apply it only to sections below the CTA targets, or render the target and everything above it on a hash/CTA click), prove the CTA scroll test still passes on all three browsers, and re-measure with the same method. Target LCP under 2.5 s with applied throttling.
2. **Real imagery (P2).** Replace the single AI-generated image on `/about` with real photography after the first event; until then keep the "conceptual" caption. The site's identity is carried by type and the sculpture, which is the right call without photography.
3. **Give the media pages distinct identities (P2)** once there is content: one real poster frame per episode, an audio waveform treatment for the podcast, a different header composition. Today the three pages share one layout because they share one truthful message.
4. **Admin: per-user accounts (P1), then uploads and preview (P2).** See section 14. Upload for logos and the prospectus needs type and size validation; preview-before-publish.
5. **Vary the inner-page header sculpture (P2)** (crop, flip, accent colour per section) so a long browsing session does not see the identical fragment on every page.
6. **Add Lighthouse CI** with a mobile budget so performance cannot silently regress.

## 13. Process note

My earlier cleanup assumed port 3300 was mine. A second Lighthouse run against `localhost:3300/?v=nojs`, which I did not start, and a Next server for a different project (`tristar1947`) appeared on this machine. **I force-killed one process (PID 9684) listening on 3300 that I believed was mine and cannot be certain was.** If another session's server on that port stopped unexpectedly, that was me. I moved to a private port (3417) and now terminate only processes I launched.

## 14. Administrator security review

The admin is a temporary single shared password. Reviewed in code (`src/lib/admin-auth.ts`, `src/app/api/admin/login/route.ts`, `src/app/admin/actions.ts`); it was not penetration-tested.

| Area | Status |
|---|---|
| Authentication | One shared password (`ADMIN_PASSWORD`, at least 12 characters) plus `SESSION_SECRET` (at least 32). The admin refuses to work if either is missing; there is no default account. Password compared via HMAC and `timingSafeEqual`. **Limitation: no individual accounts, no roles, no MFA, no password reset; everyone who knows the password is "organizer".** |
| Session | Signed (HMAC-SHA256) stateless cookie: `HttpOnly`, `SameSite=Strict`, `Secure` in production, 8-hour expiry. **Limitation: no server-side revocation.** Logging out clears the cookie but a copied cookie stays valid until expiry; rotating `SESSION_SECRET` invalidates every session. |
| Brute force | Per-IP limit of 5 attempts a minute, origin check first. **Added in this pass:** a global cap of 30 failed sign-ins per 10 minutes regardless of IP (the IP comes from `x-forwarded-for`, which a client could rotate if the app were reachable without a proxy that overwrites it) and a 400 ms delay on each failure. Trade-off: a determined attacker could temporarily lock the organiser out; the cap is deliberately high. **Limitation: the counters are in memory, per instance; they reset on restart and are not shared across serverless instances. Use a shared store or the host's WAF before scaling out.** |
| Credential storage | The password lives only in the server environment (not in the database or repository); `.env.local` is git-ignored. No password hashing at rest is needed for an env secret, but there is no rotation policy. |
| Authorization | Verified: all 17 admin server actions call `requireAdmin()` and the résumé download calls `isAdmin()`; the admin page checks the session; an automated test shows anonymous access is refused everywhere and that résumé download needs the session. Server actions re-check the cookie, so hiding UI is never the control. |
| Auditability | Content and status changes are written to `audit_log` (action, entity, id, metadata). **Added in this pass:** `admin.login`, `admin.login_failed` (with client IP) and `admin.logout` (only for a real session). Verified in the disposable test database: 3 logins, 1 failed login recorded. **Limitation: every row's actor is the constant "organizer", so it cannot say which person acted, and there is no admin screen to view the log.** |
| Student personal data | The admin shows names, emails, phone numbers and résumés. Résumés are never publicly addressable (admin-only route, `private, no-store`, `nosniff`). Erasure exists (`eraseStudent`). **Risks: shared password means a leaver keeps access until it is changed; no export/retention policy is enforced in code; a stolen cookie reads everything for up to 8 hours.** |

**Production requirement (P1):** replace the shared password with individual accounts (an identity provider with MFA is the smallest route), record the real actor in the audit log, add server-side session revocation, and move rate limiting to a shared store. I did not build this: it is a new authentication architecture, and nothing found here was a high-severity defect that justified one in a verification pass.

## 15. Screenshot evidence (`docs/acceptance/`)

These are real captures from this engagement, copied unmodified from the scratch folder; none were regenerated.

| File | What it shows |
|---|---|
| `hero-mobile-390-before.png` | Mobile hero at 390 px as first inspected: "Opportunity" clipped to "Opportunit", artwork running behind the links and buttons. |
| `hero-mobile-390-after.png` | Same width after the purpose-built composition: full headline, copy first. |
| `hero-mobile-390-after-art.png` | Same page scrolled: the sculpture as a full-width band between the buttons and the secondary links. |
| `partners-desktop-after.png` | Partners page after the changes: role-grouped plates, typographic fallbacks, no sponsorship claims. |
| `sponsors-desktop-after.png`, `sponsors-mobile-after.png` | Sponsors page after the at-a-glance strip and enquiry changes. |

I deliberately did not include an earlier full-page partners capture in which sections appear empty: that image was taken before the scroll-reveal animations had run, so it is a capture artefact, not a defect, and would mislead as "before" evidence. There is no like-for-like "before" capture of the partners and sponsors pages at the baseline commit; I have not fabricated one. I reviewed the included images and found no material design defects.

## 16. Functional fixes: what was verified and how

| Claim | Evidence |
|---|---|
| Candidate "Continue" never submits early; only the final action submits | Reproduced and fixed (React reused one element for both buttons; now keyed). Test asserts no error alerts on arrival at the consent step; it fails without the fix and passes with it. |
| Validation is accessible | Errors render in `role="alert"` live regions; axe: 24 checks, zero violations. **Not tested with a screen reader.** |
| Sponsor enquiries persist; admin access is authorised | Cross-browser test submits an enquiry, then the admin Sponsorship tab shows it with its `TBR-S-` reference; anonymous admin access is refused. The confirmation says no automatic receipt was sent because mail is not configured. |
| Public legal pages carry no internal notes or confidential figures | Test scans every public route for drafting phrases, vendor cost and quotation wording. |
| Prospectus gate | Four states tested by the e2e test (including approved without a file, and a file without approval): public only when approved **and** a real PDF exists; file lives in `private/`, not `public/`; `.gitignore` now also excludes `private/prospectus/*.pdf`. |
| DB reset fails closed | 19 unit tests plus four manual break attempts in the earlier pass (section 8), each refused. Verified before every run in this pass. |
| Modal focus, Escape, focus return | Firefox, WebKit and Chromium tests: Escape closes, focus returns to the menu button, Tab never reaches the page behind. |
| Mobile hero never clips | Tested at widths from 320 to 1920 px in all three browsers. |
| Reduced motion | Tests in all three browsers: nothing stays hidden, nothing animates forever. |

## 17. Repository hygiene and commit

Checked before committing: no secrets found by pattern scan of tracked files (live/test payment keys, cloud keys, private keys, mail keys, connection strings with credentials); no `.env*` file tracked (only `.env.example`); `.data/` ignored. Found and fixed: `test-results/.last-run.json` had been tracked (now untracked and ignored). The confidential vendor figure was removed from internal docs; the test that scans for it keeps the pattern. Repository size is 5 MB; no large binaries added (screenshots 3.4 MB). Final commit details are in the git log of branch `believing-room-redesign`; nothing was pushed or deployed.
