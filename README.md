# The Believing Room

A plain Next.js frontend. No database, no admin area, no payments, no accounts.

- **Content** lives in the code: `src/content/*`, `src/config/*`, and `src/lib/content.ts` (partners, packages, episodes, events).
- **Forms** (candidate, audience, waitlist, company, college, sponsor, contact) post to `/api/submit/<form>`. The route validates
  the input and appends one row to a tab of a Google Sheet through a small Apps Script web app.
  Setup takes about five minutes: see [`google-sheets/SETUP.md`](google-sheets/SETUP.md).
- **Admin portal** (`/admin`): password-protected view of that same sheet, to search, filter, review, edit, delete, copy and export
  every submission. The sheet is the database. Set `ADMIN_PASSWORD`; details in the same setup guide.

## Run

```bash
cp .env.example .env.local   # fill in GOOGLE_SHEET_WEBHOOK_URL, GOOGLE_SHEET_SECRET and ADMIN_PASSWORD
npm install
npm run dev
```

Without the two Google Sheet variables the site still runs; forms answer "We can't take submissions right now".

## Checks

```bash
npm run check        # typecheck + lint + unit tests
npm run build && npm run test:e2e
```

## Adding or changing form fields

1. Add the field to the schema in `src/lib/validation.ts`.
2. Add its column header in `src/lib/forms.ts`. The sheet gets the new column on the right automatically.
3. Add the input to the form component in `src/components/forms/`.
