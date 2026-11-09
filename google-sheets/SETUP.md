# Google Sheet as the database, and the admin portal

Every form on the site (candidate, audience, waitlist, company, college, sponsor, contact) posts to
`/api/submit/<form>`, which validates the input and appends one row to a tab in your Google Sheet.
Tabs are created automatically on the first submission: Candidates, Audience, Waitlist, Companies, Colleges, Sponsors, Contact.

The **admin portal at `/admin`** reads that same sheet and lets you manage it: search, filter, sort, group, review
(status and notes), edit, delete, add entries by hand, copy and export. The sheet stays the single source of truth, so
anything you change in the portal is in the sheet, and anything you change in the sheet shows up in the portal on refresh.

## 1. Connect the sheet

1. Create a new Google Sheet (any name, e.g. "The Believing Room responses").
2. **Extensions → Apps Script**. Delete the starter code, paste in `google-sheets/Code.gs`, save.
3. **Project Settings (gear icon) → Script properties → Add script property**
   - Property: `SECRET`
   - Value: a long random string (32+ characters).
4. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, authorise when asked, and copy the **Web app URL** (ends in `/exec`).
5. Give the website two environment variables (`.env.local` locally; Project → Settings → Environment Variables on Vercel):
   ```
   GOOGLE_SHEET_WEBHOOK_URL=<the /exec URL>
   GOOGLE_SHEET_SECRET=<the same value as SECRET>
   ```

## 2. Turn on the admin portal

Add two more environment variables, then redeploy:

```
ADMIN_PASSWORD=<10+ characters, ideally a passphrase>
ADMIN_SESSION_SECRET=<optional: any long random string>
```

Open `https://<your-site>/admin` and sign in. Without `ADMIN_PASSWORD` the portal stays locked and says so.
Sessions last 8 hours. Changing either value signs everyone out.

## 3. Redeploy the script after updating it

**If you set the sheet up before the admin portal existed, you must update the script**, or the portal will say
"The Google Apps Script is the old version".

Paste the new `Code.gs` over the old one, then **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**.
The URL and secret stay the same, and the website's forms keep working throughout.

## What the portal does

| | |
|---|---|
| **Overview** | Totals, today / 7-day counts, submissions per day, items waiting for review, audience seats booked, latest activity |
| **One view per form** | Candidates, Audience, Waitlist, Companies, Colleges, Sponsors, Contact, plus any extra tab you add to the sheet |
| **Find** | Free-text search across every column, status chips, date range, and category filters (college, industry, year…) built from your data |
| **Organise** | Sort by any column, group by a category, choose which columns show, 25/50/100/all per page |
| **Review** | Each row has a status (New, In review, Contacted, Shortlisted, Confirmed, Waitlisted, Declined, Archived) and private notes. Change one inline, or many at once |
| **Edit** | Open a row to see everything, fix any field, step to the next or previous row. Date and reference are locked |
| **Add / delete** | Add a walk-in or phone registration; delete rows (asks first). Archive is the gentler option |
| **Copy** | Copy one field, a whole row, rows as a table to paste into Sheets or Excel, or all the emails in view |
| **Export** | CSV (opens cleanly in Excel) or JSON of whatever is selected, or filtered, or everything |

Status and Notes are stored as two extra columns, **Status** and **Notes**, on the right of each tab. They are created
the first time you use them. Don't rename them.

## Safety

- Only someone with the password reaches the portal; the data endpoints reject everyone else, and the pages are
  marked `noindex` and kept out of `robots.txt`.
- Your sheet's URL and secret never reach the browser. The portal talks to the sheet from the server.
- Every edit and delete carries a fingerprint of the row as the portal last saw it. If the row moved or changed in the
  sheet in the meantime (say you sorted it by hand), the write is **refused** rather than landing on the wrong row,
  and the portal refreshes. Sorting the sheet by hand is safe; just refresh the portal afterwards.
- Text starting with `=`, `+`, `-` or `@` is stored as text, never run as a formula, and CSV exports neutralise it too.
- Deleted rows can only be recovered through Google Sheets' version history (File → Version history).

## Notes

- A field added to a form in the code appears as a new column on the right; existing columns and rows are untouched.
- "Anyone" on the web app means anyone holding the URL *and* the secret can read or write rows. Treat the secret like a
  password. The sheet itself stays private to you.
- Without the sheet variables the forms say "We can't take submissions right now" rather than pretending to save.
- The sheet's size limits are the portal's limits: it loads every row on each refresh, which is comfortable into the
  low thousands of rows per tab.
