# Connecting the forms to a Google Sheet

Every form on the site (candidate, audience, waitlist, company, college, sponsor, contact) posts to
`/api/submit/<form>`, which validates the input and appends one row to a tab in your Google Sheet.
Tabs are created automatically on the first submission: Candidates, Audience, Waitlist, Companies, Colleges, Sponsors, Contact.

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
6. Redeploy, submit a form, check the sheet.

Notes
- After editing `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**; the URL stays the same.
- A field added to a form in the code appears as a new column on the right; existing columns and rows are untouched.
- "Anyone" means anyone holding the URL *and* the secret can add rows. The sheet itself stays private to you.
- Without these variables the forms say "We can't take submissions right now" rather than pretending to save.
