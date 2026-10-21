# Protected Vercel preview: readiness and release plan

Date: 21 October 2026. Status: **code is ready; nothing has been deployed, linked, provisioned, pushed, or changed on Vercel or GitHub.** Every Vercel and GitHub action in this document was read-only. The deployment waits for your approval (section 8).

## 0. Readiness verdict (six separate answers, not one PASS)

| Category | Verdict | Basis |
|---|---|---|
| Code ready | **Yes, for a protected preview** | TypeScript, ESLint, unit tests (including a hosted-Postgres path test), production build and the browser suite pass (numbers in section 9). |
| Infrastructure ready | **No** | No preview database exists. No environment variables are set on the Vercel project. The project and a hosted database must be approved and configured (sections 7 and 8). |
| Protected preview ready | **Not yet; ready once the plan is approved** | Preview URLs are already behind Vercel Authentication (observed). The app now also refuses to serve anyone unless a gate password is set. Neither has been exercised on a real Vercel preview yet. |
| Public informational launch ready | **No** | The privacy notice is incomplete, the legal review of the agreements has not happened, and the Hobby plan is for non-commercial use. |
| Public registration ready | **No** | Needs the written approvals in section 5. The code keeps registrations closed by default. |
| Payment collection ready | **No** | Terms, refund policy, amounts and provider are unapproved; no live payment has ever run. Payments stay off. |

## 1. What exists on Vercel and GitHub today (read-only audit)

- **Account:** Vercel user `shashwat-k-9114`, Hobby plan, one scope ("Shashwat's projects"). The Vercel connector in this session lacks access to that scope (HTTP 403), so I used the authenticated Vercel CLI for read-only listing. The account also holds a dozen unrelated projects. I touched none of them.
- **A project already exists:** `thebelievingroom` (id `prj_Q1vFHPsTwSnppsKXmee1g5Jty4yH`), created 21 October 2026 09:59 IST. Framework Next.js, Node 24.x, region `iad1` (Washington DC). Linked to GitHub `Shashwat-k-9114/The-Believing-Room`, production branch `main`. **No environment variables are set.** No database or storage integration is attached.
- **GitHub:** the only remote branch is `main`, at commit `6c75c35` (the commit before the brand pass). The local branch `believing-room-redesign` (the brand pass, `e7c8b27`, and this work) has not been pushed.
- **A production deployment is live and public.** Vercel built `main` (`6c75c35`) automatically as Production, status Ready. Observed from outside, without credentials:
  - the unique deployment URL (`thebelievingroom-ix4jhhatb-…vercel.app`) redirects to Vercel's login (protected);
  - **the production address `https://thebelievingroom.vercel.app` is not protected.** Static pages answer 200 (for example `/terms` and `/robots.txt`, and `robots.txt` is indexable); every page that touches the database answers **500**.
  - Cause of the 500s (from the runtime log): `ENOENT: mkdir '/var/task/.data'`. The old code falls back to an embedded database on local disk, which a serverless host does not have.
  - The project's protection setting is "Vercel Authentication: all deployments except custom domains". On this setup that leaves the production address open.
  - Consequence today: nothing personal is being collected (forms fail with 500, no admin credentials exist, payments are off), but draft legal wording and the proposed ₹500 / ₹300 prices are publicly readable on the static pages, and the production address is indexable.
- **Decision for you (A in section 8):** this exposure exists now and does not depend on this release. The code in this branch fixes it permanently (production serves 503 to everyone until `PUBLIC_LAUNCH_APPROVED=true`), but only once it is merged to `main`. Until then the options are to leave it, or to pause the project in the Vercel dashboard. I have done neither.

## 2. Persistence audit and what changed

| Concern | Before | Now |
|---|---|---|
| Database | Without `DATABASE_URL`, an embedded Postgres in `.data/` on local disk. Not durable, and impossible on serverless (the 500 above). | With `DATABASE_URL`, hosted PostgreSQL through node-postgres. The embedded database remains for local development and tests only. |
| Migrations | Ran on every cold start, so concurrent instances could race and every cold start paid for it. | An explicit step, `npm run db:migrate`, that prints the target host and refuses to run unless `DB_MIGRATE_CONFIRM_HOST` matches it (so a stale variable cannot migrate the wrong database). The app only verifies the schema version and fails with a clear message if the step was skipped. Setting `DB_AUTO_MIGRATE=true` restores the old behaviour for throwaway databases. |
| Connections | Pool of 5, no timeouts. | Pool of 3 (`DB_POOL_MAX`), 10 s idle release, 8 s connect timeout, a handler so a dropped idle connection cannot crash an instance, and a failed start closes its pool. Use the provider's **pooled** connection string. |
| Seeding | On every cold start; two cold instances could collide. | Same idempotent seed, but a lost race is logged and skipped instead of failing the request. |
| Résumé files | Written to local disk (lost or failing on serverless). | Stored in a `stored_files` table (bytea, 2 MB limit enforced earlier), read only through the admin route, erased with the application. No extra service. Volume limit: roughly 200 résumés per 500 MB of database; move to object storage if that is ever outgrown. |
| Rate limiting | In memory, per instance, so each serverless instance had its own counter. | Shared counters in a `rate_limits` table, one atomic upsert per request, falling back to memory (with a log line) if the database is unreachable so that a database blip does not take the site down. Fixed windows: a client can burst to about twice the limit across a window edge. |
| Schema | 3 migrations. | 4: `0003_durable_preview` adds `rate_limits` and `stored_files` (additive only, no drops). |

**What was verified, and how.** A real wire-protocol PostgreSQL server (PGlite served over TCP) was used to run the hosted code path: the unmigrated-database refusal, the migration script (host confirmation, no credentials in output, running twice is safe), seeding once, 30 concurrent pooled requests allowing exactly 4 of a limit of 4, and a binary résumé round trip including path-traversal keys. **What was not verified:** a real provider's pooler, TLS, latency and cold-start behaviour. Those are covered by the preview smoke test (section 7.6). No hosted database was touched, and the e2e suite is still prevented from touching any database that is not a disposable local one.

## 3. Security review

**Rate limiter:** see above. The shared store removes the per-instance weakness. The per-address key still trusts `x-forwarded-for`; Vercel overwrites it at the edge, which is why the shared failed-login cap below does not depend on it.

**Administrator sign-in.** Findings and changes:

1. *Shared failed-login cap as a lockout lever.* Before, 30 wrong guesses from anyone locked the organiser out of sign-in for 10 minutes. Now that cap applies only to browsers this server has not seen succeed. A signed "known device" marker (set on a successful sign-in, 30 days, no access by itself) exempts a browser from the shared cap; the marker has its own limit of 10 failures per 10 minutes. An attacker rotating addresses can therefore hold out only **new** browsers, only for the window. This is covered by an end-to-end test that burns the cap and shows a known browser still signs in. Residual risk: sign in once from your usual browser before the preview is exposed; if you are ever locked out from a new browser, wait 10 minutes, use the usual browser, or rotate `ADMIN_PASSWORD`.
2. *Accountability.* There is one shared password. The audit log records the actor as "organizer" with a `credential: shared` flag and the client address. **It shows that a sign-in happened, not which person signed in.** Do not describe it as individual accountability. Individual accounts are a later decision.
3. *Sessions* are signed, HTTP-only, same-site-strict cookies lasting 8 hours, with no server-side revocation. Signing out clears the cookie only. Rotating `SESSION_SECRET` ends every session at once. Server-side session records are a recommended later change.
4. *Sensitive records.* Every admin action was already audited; résumé downloads were not. They now are (reference only, never contents). The admin list screens are not audited (reading is not logged); a limitation.
5. *Authorization.* Every admin page, action and route re-checks the session on the server (existing tests prove anonymous users are refused everywhere).
6. *Brute force on the password itself:* per-address 5 a minute, the shared cap, a 400 ms delay per failure, and a 12-character minimum. Use a 20+ character random password in preview.

**Site gate (new), independent of search-engine hints and of the host's settings.** `src/proxy.ts` runs before every route:

- `SITE_GATE_PASSWORD` (16+ characters) set: HTTP Basic authentication on every page and API route, in any environment.
- No password, on a Vercel **preview**: every request gets 503 and `noindex`. (Opt out only with `SITE_GATE=off`, once you have verified the host's protection.)
- No password, on **production**: 503 until `PUBLIC_LAUNCH_APPROVED=true`.
- Local development and tests: open.
- Only the payment webhook path is exempt (it verifies its own signature). `noindex` is added to every gated response.

Verified on a real production-mode server: closed mode returned 503 for pages, API and `robots.txt`; password mode returned 401 without or with the wrong password and 200 with the right one. This protects a deployment even if the Vercel setting is wrong. It does not replace a strong password: Basic authentication has no lockout of its own.

## 4. Safe public functionality (unchanged by default)

| Feature | State |
|---|---|
| Payments | Off. Needs the provider keys **and** `PAYMENTS_ENABLED=true`. Not set. |
| Sponsorship prospectus | Unpublished until approved in the admin (route returns 404; tested). |
| Partner logos | Hidden until permission is recorded. |
| Analytics and advertising pixels | None exist. A test now fails if a Google, Meta or similar host is requested. |
| Event dates and internship promises | None invented. Structured data contains no events. |
| Registrations (candidate, audience, notification list) | **Closed by default.** `REGISTRATION_MODE=preview-synthetic` opens the forms under a "made-up data only" banner for the protected preview. The pages show a notice (not a form) when closed, and the APIs refuse with 403 even if called directly (tested against a server running the shipped defaults). |
| Business enquiries (sponsor, company, college, contact) | Not governed by the registration switch: they collect business contact details with consent boxes. Say so if you would rather close them too. |

## 5. Approvals needed before real candidates may register

All of the following, in writing, before `REGISTRATION_MODE=open` and a `REGISTRATION_APPROVAL_REF` (a reference such as "founders + counsel, date") are set. Without the reference the site stays closed.

1. A complete privacy notice (what is collected, why, retention, recipients including recruiters, rights, grievance contact). It is incomplete today.
2. Final candidate participation terms and media-consent wording, reviewed by an Indian advocate (the seven drafts in the legal package are drafts and have not been reviewed).
3. A final eligibility rule and age confirmation (the form has no age field today).
4. A decision on the proposed 20% charge, fees and refunds (`FOUNDER-DECISION-20PERCENT-REFUND-PROPOSAL.md`).
5. Recruiter-introduction consent on the form.
6. A production database with backups, an erasure process, and named people authorised to read applications.
7. Confirmed event date and venue permission, or applications worded so that none is promised.
8. A decision on commercial hosting (Hobby is described by Vercel as for personal, non-commercial use; confirm against their current terms).

## 6. Homepage LCP investigation

Method: production build, emulated Pixel-class phone, network 1.6 Mbps / 150 ms round trip, 4x CPU slowdown, fresh browser context per run, 7 runs per condition, medians, same machine and session. Run-to-run noise between batches was about +/-150 ms, so differences smaller than that are not findings. Lighthouse's own mobile figure (LCP 3.3 to 3.6 s) comes from a simulated model and is more pessimistic than these applied measurements.

| Condition | Median LCP | Median FCP |
|---|---|---|
| As shipped | 2.0 to 2.3 s (three batches) | 1.5 to 1.7 s |
| Entrance animations switched off | 1.53 s | 1.53 s |
| Fonts blocked (system fallback only) | about 1.2 to 1.4 s | about 1.0 s |
| Hero lede animation delay 0.7 s cut to 0.2 s | 2.01 s (no change) | 1.58 s |
| `font-display: optional` (built and measured) | 2.47 s (no improvement) | 1.61 s |

What this shows:

- The LCP element is **not stable**: across runs it is the header wordmark, the eyebrow line or the lede paragraph, depending on which paints last.
- It is a chain, not one bottleneck: HTML and a 13 KB stylesheet arrive by about 0.8 s; three font files (about 106 KB together) arrive by about 1.2 s; first paint follows at 1.5 to 1.7 s under the 4x CPU slowdown; entrance animations then reveal the rest.
- **Fonts are a real cost** (blocking them removes about 0.6 s from first paint and about 0.9 s from LCP) but the typography cannot be kept without them.
- **No tested font-loading change helps.** `font-display: optional` did not improve LCP and would show system fonts to first-time visitors. Changing the hero delays alone did not move LCP. I reverted the experiment; nothing from it is committed.
- Entrance animations are worth roughly 0.7 s in the all-animations-off condition, but the single delay I changed did not account for it, so I cannot say which part of the choreography is responsible. Removing the choreography is a design decision, not made here.
- The 1.5 s target remains unmet and unclaimed. The next steps with a real chance of moving it are a real-phone measurement (field data via Vercel Speed Insights on a preview) and, if the founders accept visible trade-offs, a shorter entrance sequence.

## 7. Preview release plan

### 7.1 Project and environment
- **Project:** the existing `thebelievingroom` (see decision B for the alternative of a new, separate one).
- **Environment:** Vercel **Preview** only. **Production receives no environment variables.**
- **Region:** the project runs in `iad1`. For an India audience a Mumbai region (`bom1`) is closer; setting it needs a `vercel.json` change that I have not made. Choose the database region first and match it.

### 7.2 Environment variables (names only, no values; Preview scope)

| Name | Preview value | Notes |
|---|---|---|
| `DATABASE_URL` | pooled connection string of the **preview-only** database | Never the production database. Never shared. |
| `ADMIN_PASSWORD` | 20+ random characters, preview-only | Not reused anywhere. |
| `SESSION_SECRET` | 64 hex characters, preview-only | Rotating it ends all admin sessions. |
| `SITE_GATE_PASSWORD` | 16+ random characters | Optional second lock; see decision D. |
| `REGISTRATION_MODE` | `preview-synthetic` | Not `open`. |
| `NEXT_PUBLIC_SITE_URL` | the stable preview address | Canonical and sharing links. |
| `PAYMENTS_ENABLED`, `RAZORPAY_*`, `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_PODCAST_PLAYLIST_URL`, `PUBLIC_LAUNCH_APPROVED`, `REGISTRATION_APPROVAL_REF` | **unset** | Unset on purpose. |

Optional: `DB_POOL_MAX` (default 3), `RATE_LIMIT_STORE`, `STORAGE_DRIVER` (defaults already choose Postgres when `DATABASE_URL` is set).

### 7.3 Database and migration steps
1. Create a new, empty, preview-only PostgreSQL database (decision C). Record the pooled and direct connection strings in the Vercel Preview environment and a password manager; never in the repository.
2. From this repository, with the **direct** (non-pooled) string: `DATABASE_URL=… DB_MIGRATE_CONFIRM_HOST=<that host> npm run db:migrate`. It must report 4 migrations applied.
3. The first page request seeds the confirmed partner organisations and sponsorship packages once.
4. Check `/api/health`: `database: ok`, `rateLimitStore: postgres`, `fileStorage: postgres`, `registrationMode: preview-synthetic`, `paymentsCollecting: false`.

### 7.4 Protection configuration
Two independent layers, both to be verified by an unauthenticated request after deployment:
1. Vercel Authentication on Preview deployments (already set on the project; I observed the unique deployment URL redirect to login).
2. The in-app gate: either `SITE_GATE_PASSWORD`, or the fail-closed 503. A preview that is neither authenticated nor password-gated must return 401, 503 or a Vercel login, never a page.
`noindex` is added on top and is not counted as protection.

### 7.5 Indexing and URL structure
Non-production deployments send `noindex` and a disallow-all `robots.txt`. Preview addresses take the forms `thebelievingroom-<hash>-shashwats-projects-bd30a0f7.vercel.app` (unique per deployment) and a branch alias beginning `thebelievingroom-git-<branch>-…`, which Vercel shortens when the name is long. The production address `thebelievingroom.vercel.app` is untouched by a preview deployment.

### 7.6 Browser smoke-test plan (on the real preview, synthetic data only)
1. Unauthenticated request: no page content (login, 401 or 503).
2. Authenticated: home, show, sponsors, terms, refund-policy render; one h1 each; no console errors.
3. `/api/health` as in 7.3. `robots.txt` disallows all. Response headers carry `noindex`.
4. Submit a synthetic candidate application with a small test PDF; confirm the reference screen, the row in the admin, and that the résumé downloads once (and the download appears in the audit log).
5. Sponsor enquiry with a synthetic organisation; confirm it is saved and the page does not claim an email was sent.
6. Admin: sign in, change a status, sign out. Wrong-password attempts are throttled.
7. Redeploy once and confirm the synthetic records persist (the cold-start and redeploy persistence check).
8. 20 concurrent submissions: no 500s, all persisted, rate limiting returns 429 for the excess.
9. Payment surfaces say nothing is charged; the prospectus route returns 404.
10. Record real-device mobile load timings for the LCP follow-up.

### 7.7 Rollback
Preview deployments do not touch production. To undo: delete the preview deployment, delete the Preview environment variables, delete the preview database. If any change is later merged to `main`, revert that commit or use Vercel's rollback; the gate keeps production closed by default either way. Nothing here changes DNS.

### 7.8 Expected costs and limits
- Vercel Hobby: no charge for the project, but Vercel restricts Hobby to personal, non-commercial use. A commercial launch (sponsorship, ticketing) should be on a paid plan; confirm against Vercel's current terms. I have not checked live pricing.
- Preview database: a free-tier hosted PostgreSQL (for example through the Vercel Marketplace) is expected to be enough for synthetic testing; free tiers typically cap storage, compute hours and idle behaviour, and the database may pause when idle and take a moment to wake. **Verify the current limits when creating it; I have provisioned nothing and checked nothing live.**
- Résumés stored in the database count against its storage limit.

## 8. Approval checkpoint: what I need from you

Nothing below has been done. Please answer each:

- **A. The live production address.** Leave `thebelievingroom.vercel.app` as it is (public static pages, 500s elsewhere), or pause the project until the gated code ships? Merging this branch to `main` would also fix it, but that is a push, which needs your separate approval.
- **B. Which Vercel project.** Use the existing `thebelievingroom` (Preview environment only; Production untouched), or create a new separate project for previews. I recommend the existing one, with no variables on Production.
- **C. Which database, and any new service or charge.** I recommend a **new, empty, preview-only** PostgreSQL (for example a free-tier database created through the Vercel Marketplace), connected to the Preview environment only. No existing database will be connected. Confirm the provider and that a new account or service may be created (expected cost: free tier; to be verified).
- **D. Access protection.** Vercel Authentication (already on) plus, as a second lock, either a shared gate password (`SITE_GATE_PASSWORD`, which I would generate and hand to you outside the repository) or the fail-closed default only. Anyone you want to see the preview will need a Vercel login with access, or the gate password.
- **E. Features on the preview.** Proposed: registrations in `preview-synthetic` mode; payments, prospectus, partner logos, analytics and pixels all off; email off (the UI says so).
- **F. How to deploy, and impact on existing things.** Option 1: `vercel link` here (creates a local, ignored `.vercel` folder) and `vercel deploy` for a preview, with no push to GitHub. Option 2: push the branch to GitHub so Vercel builds a preview, which also publishes this code to that repository. Either creates a Preview deployment on the existing project and does not change the existing production deployment, its address, its domains or DNS. Choose 1 or 2.

I will not link, set variables, provision, push or deploy until you answer.

## 9. Verification

See the final report for the verified counts. All code changes are committed locally on `believing-room-redesign`. `.env.local` (not tracked) gained `REGISTRATION_MODE=preview-synthetic` so local development keeps working.


---

# Deployment record: protected Preview, 21 October 2026

Authorised by the founders' deployment decisions A to J. One Preview deployment was made from the local CLI. Nothing was pushed to GitHub, merged to `main`, promoted to production, or changed in DNS.

| Item | Value |
|---|---|
| Vercel account / scope | `shashwat-k-9114` (Hobby), scope `shashwats-projects-bd30a0f7`, team `team_kSrDQauCdYcWJNQPBtiv7HNu` |
| Project | existing `thebelievingroom` (`prj_Q1vFHPsTwSnppsKXmee1g5Jty4yH`), linked GitHub repo `Shashwat-k-9114/The-Believing-Room`, production branch `main`. Verified before linking. No second project was created. |
| Preview deployment | `dpl_4qLKeMXfJchbQoX9eZYXcvwwSBqN`, `https://thebelievingroom-925kvhz95-shashwats-projects-bd30a0f7.vercel.app`, source `cli`, target preview, state READY |
| Code | local commit `84b0e88` (successor of `2b87e56`) |
| Platform protection | Vercel Authentication, **All Deployments** (`ssoProtection.deploymentType = all`), set on this project only. No password protection, trusted IP, bypass secret or custom domain. |
| Application gate | `SITE_GATE_PASSWORD` set for Preview (sensitive). Without it the app returns 503 on preview. |
| Database | New, empty Neon project `tbr-preview-synthetic` (Vercel Marketplace, Free plan `free_v3`, no payment method, 1 GB, region iad1), connected to the **Preview** environment only. Not connected to Production or Development. The team's other Neon database (`temple-of-healing-db`) was not touched. |
| Migrations | `npm run db:migrate` with `DB_MIGRATE_CONFIRM_HOST`, against the direct (unpooled) endpoint: 4 migrations applied, re-run safe. The app uses the pooled endpoint with `DB_POOL_MAX=3` and refuses to start against an unmigrated database. |

## Preview-only environment variable names

`DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED`, `POSTGRES_*`, `PG*`, `NEON_PROJECT_ID` (all from the Neon integration), `ADMIN_PASSWORD`, `SESSION_SECRET`, `SITE_GATE_PASSWORD` (sensitive), `REGISTRATION_MODE=preview-synthetic`, `DB_POOL_MAX=3`. Production has none of them. Payments, analytics and `REGISTRATION_APPROVAL_REF` are unset.

## Evidence

- Anonymous requests to every path tried (pages, `robots.txt`, `/api/health`, admin login, résumé route, unique deployment URL, aliases) are redirected to Vercel login or get 401. Anonymous POST to `/api/candidate` gets 401.
- Platform pass without the application password: 401 with `WWW-Authenticate: Basic` on every path. Wrong password: 401.
- Both layers: 22 of 22 deployed acceptance tests pass (`playwright.deployed.config.ts`): health reports database ok, rate limiter in Postgres, file storage in Postgres, payments not collecting; every public page renders with one h1 and no console errors; no third-party tracker hosts; synthetic banner shown; validation, wrong-origin and fake-PDF rejections; synthetic application accepted with a résumé; sponsor enquiry stored; admin refuses anonymous and wrong password; the organiser sees the application and downloads résumé bytes identical to those uploaded; audit log records the login and the download; prospectus 404; audience order unavailable; unsigned webhook and forged checkout rejected; no secrets or internal documents reachable; repeated bad requests rate limited; no horizontal overflow on nine pages at phone width.
- Direct query of the Neon database: 4 migrations, 2 candidate rows with 2 stored résumés, 1 sponsor enquiry, the audit entries, 8 rate-limit rows. Requests were served by several different function instances, so state is shared, not per instance.
- Runtime logs: no application errors. The only error-level lines are Node's one-time notice that `sslmode=require` is treated as `verify-full` (the safe behaviour). Writing `sslmode=verify-full` explicitly would silence it; not changed because a second deployment was not authorised.

## Not verified

- Persistence across a **redeployment**: only one deployment was authorised. The database and its variables are independent of deployments, so it is expected to hold, but it is untested.
- Cold-start latency was not measured separately. Warm `/api/health` took roughly 0.5 to 2 seconds from this machine.
- The Vercel preview toolbar script (`vercel.live`) is blocked by the app's content security policy. That is the platform's own injected script and the block is intended.

## Incidents during the work

- The Vercel CLI (`vercel curl`) created an automation-bypass secret on the project, and a diagnostic command printed it into the working session. It was used only for the acceptance run and then **revoked**; the project has no bypass entries and the old value now gets the platform redirect.
- Linking the folder made the CLI add `.env*` to `.gitignore`, write an OIDC token into `.env.local`, and add `.agents/`, `.claude/` and `skills-lock.json`. All were reverted or removed before the commit.

## Rollback and cleanup

1. Remove the preview: `vercel remove thebelievingroom-925kvhz95-shashwats-projects-bd30a0f7.vercel.app --scope shashwats-projects-bd30a0f7` (affects only that deployment).
2. Remove the database: delete the Neon resource `tbr-preview-synthetic` in the Vercel dashboard (Storage). This deletes its synthetic data and removes the Preview variables it injected.
3. Remove the app variables: `vercel env rm ADMIN_PASSWORD preview` (and `SESSION_SECRET`, `SITE_GATE_PASSWORD`, `REGISTRATION_MODE`, `DB_POOL_MAX`).
4. The platform protection change is recommended to stay in place; it is the only thing between the broken production deployment and the public.
5. Rotate the preview passwords by `vercel env add ... preview --force` and redeploy.

## Backup and recovery (Neon Free)

Neon keeps a short point-in-time-restore history on the Free plan (check the current window in the Neon console before relying on it). The database holds only synthetic data; recovery means re-running `npm run db:migrate` on a new empty database. Do not use the preview database for anything that cannot be recreated.

## Readiness, kept separate

| Category | Status |
|---|---|
| Protected Preview deployed and verified | **Yes**, with the "not verified" items above |
| Public informational launch | **Not approved.** Needs the production `NEXT_PUBLIC_SITE_URL`, a production database, legal review, image rights, `PUBLIC_LAUNCH_APPROVED`, and an explicit founder decision. |
| Public candidate registration | **Not approved.** Needs the completed privacy notice, candidate terms, approved refund policy, a production database and `REGISTRATION_APPROVAL_REF`. |
| Payment collection | **Not approved.** Needs provider, amounts, refund policy and tested webhooks. |

## Limiter failure behaviour and the shared-password admin (residual risk)

- Sign-in, audience-order, payment-verify and candidate-pay routes now **fail closed**: if the Postgres limiter errors, the request is refused (and logged) instead of falling back to a per-instance memory counter. Public low-risk forms (enquiries, waitlist, candidate application) degrade to the memory limiter with a logged warning, which is weaker across instances but does not take the form down. Covered by a unit test.
- Lockout resistance: the all-clients failure cap (30 in 10 minutes) applies only to browsers that have never signed in; a browser that has signed in carries a signed device marker and has its own, separate limit. An attacker can therefore lock out only new browsers for up to 10 minutes. Recovery: use the usual browser, wait, or rotate `ADMIN_PASSWORD`.
- Residual risks: one password is shared by every organiser, so the audit log shows that a sign-in or a résumé download happened, from which address, but **not which person**. There is no per-person revocation: removing one person's access means rotating the password for everyone. The device marker is a convenience, not a second factor. If the database is down, organisers cannot sign in at all. Individual accounts are the fix before real data is held.
