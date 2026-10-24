# Website fixes: audit, changes and open decisions

Scope note: since commit `b4ac735` the site is **frontend only**. There is no database, login, candidate dashboard, payment or ticket generation. Forms validate on the server (`/api/submit/[form]`) and append a row to a Google Sheet. Requirements that assume accounts, stored status, tickets or payments therefore have nothing to attach to. They are marked BLOCKED below rather than faked.

## Issue matrix

| ID | Requirement | Existing behaviour | Root cause | Fix | Status |
|---|---|---|---|---|---|
| BR-01 | Registration, dashboard, personalisation | Candidate form validates server-side and writes to a sheet. No accounts, profile, dashboard or duplicate check. | Removed on purpose in `b4ac735`. | None. Needs an architecture decision: restore accounts and a database, or keep sheet-only. | BLOCKED |
| BR-02 | Remove Free Learning | Homepage act, `/partners` section, candidate-form note, ecosystem group, "Educational Partner" sponsor format. | Feature added across several surfaces. | All removed from view. Records kept (`content.ts`, `Education.tsx`) in case the partnership is revived. | IMPLEMENTED, tests passed |
| BR-03 | Audition journey and status | Journey and How-it-works copy already say no guarantee, offers "may" follow. No per-candidate status. | No stored status. | Copy reviewed, no overclaims found. Admin-controlled statuses need BR-01 infrastructure. | PARTIAL (copy only) |
| BR-04 | Ticket quantities | Audience form allowed 1–6 via buttons, hard limit. | Limit hard-coded as one number. | Quick picks to 5, then a "More" custom field. Limits live in `pricing.audienceTickets`, enforced identically in the server schema. | IMPLEMENTED, unit tested |
| BR-05 | Name on ticket | No tickets are generated. | Payments and tickets removed. | None. | BLOCKED |
| BR-06 | Terms and No Show | "No-show" wording exists in `policies.ts` ("No refunds") and `faq.ts`. | n/a | Proposal below. Not published. | PROPOSAL ONLY |
| BR-07 | Enquiry button | "Enquire about this format" was a bare `#enquiry` anchor: it scrolled but did not say which format. | No link between button and form. | Button now passes `?interest=<format>`, form pre-selects it. Submission path unchanged. | IMPLEMENTED, e2e passed |
| BR-08 | Partner mentions | Two partner records were published without a current confirmation decision. | n/a | Removed the unconfirmed partner records from public organization data and reference markup. | IMPLEMENTED |
| BR-09 | Two-month test | No reference found anywhere in `src`. | n/a | Nothing invented. Needs the intended rule. | BLOCKED (info) |
| BR-10 | Dates and places | No date or venue is published (`season.date` and `season.venue` are `null`, shown as "to be announced"). One target window string exists. | n/a | See below. | REPORT |

## BR-06 Terms: where "no-show" appears, and a proposed replacement

Occurrences:
- `src/content/policies.ts`, "No refunds": "All fees are non-refundable, including for no-shows, late arrivals and personal cancellations."
- `src/content/faq.ts`, refund question: "Fees are non-refundable, including for no-shows and personal cancellations..."
- `src/content/policies.ts`, "Arrival": late arrivals may lose a slot or seat without refund.
- The same terms render on `/terms` and `/refund-policy`; the checkbox on the audience form links to them.

Proposed wording (needs owner and legal approval before any publish):

> **Attendance and cancellation.** Please arrive at the time on your confirmation. If you cannot attend, tell us as early as you can at the contact email. Registrations can be transferred to another person up to 48 hours before the show, as described under Transfers. Fees are refunded only if The Believing Room cancels or postpones and you choose a refund. [Owner to confirm: whether any other refund or rescheduling is offered.]

When approved: change all three places together, add a `termsVersion` and date, and store the accepted version with each submission (the sheet currently records only that the box was ticked).

## BR-08 Removed partner mentions

| Surface | Previous state | Current state |
|---|---|---|
| Public organization data | Included unconfirmed partner records | Only currently approved organization records remain |
| Static reference markup | Included an unconfirmed partner logo entry | Unconfirmed partner logo entries removed |

The unconfirmed records and reference markup were removed at the owner's request. They can be restored later only after written confirmation is available.

## BR-09 Two-month test

No text in the site refers to a two-month period. Needs the intended rule: what the two months are (assessment, internship, process) and from when.

## BR-10 Dates and places

- No event date or venue is published. Pages consistently say "to be announced".
- `DEFAULT_TARGET_WINDOW = "First week of November"` in `src/config/ecosystem.ts` is a public target. Today is 2026-10-23 and no date is announced, so please confirm or clear it.
- Footer and layout say "© 2026" (fine).

## Decisions needed

1. Audience quantity: confirm the real maximum per order (code still allows 6, with the custom field now available).
2. Accounts, dashboard, tickets, payments: restore them or stay sheet-only (blocks BR-01, 03, 05).
3. Approve the attendance wording above.
4. Partner wording and the meaning of the handwritten note (BR-08).
5. The two-month rule (BR-09) and the November target window (BR-10).

## Verification run

- `npm run typecheck`: pass. `npm run lint`: pass. `npm test`: 28 passed (added quantity tests).
- `npm run build`: pass.
- Playwright, Chromium desktop: 65 passed, 2 failed before the test update. One failure was the homepage test still expecting the removed Futured entry (fixed and rerun: passes). The other, `brand.spec.ts` `/icon.svg`, 404s because the app ships `icon.png`; stale test, not touched here.
- Not run: Firefox and WebKit projects, mobile viewport, and the sponsor flow against the live Google Sheet.

## Rollback

Everything is one commit. `git revert <commit>` restores the learning sections, the old quantity limit and the old enquiry links.
