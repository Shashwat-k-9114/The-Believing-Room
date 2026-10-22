# Going public, free: informational site only

Result: the public site is visible to everyone; **registrations stay closed and payments stay off** (the defaults). Costs nothing: Vercel Hobby and Neon Free. Not run yet; every step below changes Production and needs the founders' go-ahead.

Why the site shows "This site is not publicly available yet.": production stays locked (HTTP 503) until `PUBLIC_LAUNCH_APPROVED=true`. Production also has no database yet, and Vercel Authentication still covers all deployments.

Project `thebelievingroom`, scope `shashwats-projects-bd30a0f7`. Run from the repo folder. In the Claude Code prompt, prefix each command with `!` to run it there.

## 1. Free production database (separate from the preview one)

```
vercel integration add neon --plan free_v3 --name tbr-production -m region=iad1 -m auth=false -m realtime=false -e production --no-env-pull --non-interactive
```

Then delete anything the CLI wrote into the repo: `.agents/`, `.claude/`, `skills-lock.json`.

## 2. Apply the migrations to it

Pull the Production variables to a scratch file outside the repo, then run the migration against the direct (unpooled) endpoint:

```
vercel env pull ../prod.env --environment production
```
Set `DATABASE_URL` to the value of `DATABASE_URL_UNPOOLED` and `DB_MIGRATE_CONFIRM_HOST` to its host, then `npm run db:migrate`. Expect "Done. 4 migrations are applied." Delete `../prod.env` afterwards.

## 3. Production variables (names only; generate fresh random values, never reuse the preview ones)

`ADMIN_PASSWORD` (sensitive), `SESSION_SECRET` (sensitive, 32+ chars), `NEXT_PUBLIC_SITE_URL=https://thebelievingroom.vercel.app`, `PUBLIC_LAUNCH_APPROVED=true`, `DB_POOL_MAX=3`.
Leave unset: `REGISTRATION_MODE` (closed), `REGISTRATION_APPROVAL_REF`, `SITE_GATE_PASSWORD`, `PAYMENTS_ENABLED`, provider keys.

`NEXT_PUBLIC_SITE_URL` is baked in at build time, so set it before step 5.

## 4. Platform protection: previews only

Dashboard: Project, Settings, Deployment Protection, Vercel Authentication, choose **Standard Protection / Preview deployments only** (API value `ssoProtection.deploymentType = "preview"`). Preview deployments, including the synthetic one, stay protected. Production becomes public.

## 5. Rebuild Production

```
vercel redeploy thebelievingroom-5un7s1wno-shashwats-projects-bd30a0f7.vercel.app --target production
```
(or push any commit to `main`).

## 6. Verify anonymously

`/`, `/the-show`, `/sponsors`, `/partners` return 200 with no sign-in; `/robots.txt` is indexable; `/api/health` shows `database: ok`, `registrationMode: closed`, `paymentsCollecting: false`; candidate and waitlist APIs return 403 `closed`; `/sponsors/prospectus` is 404; `/admin` signs in only with the new password.

## 7. Rollback

Dashboard, Deployments, promote the previous production deployment, or set `PUBLIC_LAUNCH_APPROVED` back to `false` and redeploy: the site returns to the lock screen in one step.

## Things to know before flipping it

- **Hobby plan terms:** Vercel's free Hobby plan is for personal, non-commercial use. A recruitment and sponsorship business may need Vercel Pro (paid) to be within the terms. Neon Free has no such restriction. This is a policy question, not a technical one.
- **Image rights** for the two supplied artworks on `/the-show` are still unconfirmed (see `BRAND-ASSETS.md`).
- Public sponsor, contact and enquiry forms collect personal details even with registrations closed; the privacy notice is still incomplete.
- Still blocking real registrations and payments: privacy notice and candidate terms, refund policy, legal review, provider and webhook tests.
