# Founder decision: payments, registration stages and terms

Status: **needs your decision. Nothing here has been changed in the public legal wording.** This is not legal advice. Items marked ⚖ should be reviewed by a qualified lawyer before launch.

## What the site does today (verified in code)

- Applying as a candidate is free. The form collects no money (`src/app/api/candidate/route.ts`).
- Fees: candidate ₹500, audience ₹300, food included (`src/config/site.ts`).
- Candidate payment stage is `after_shortlist` by default. The pay page and API only accept payment when the application status is `shortlisted` (`src/app/pay/[ref]/page.tsx`, `src/app/api/candidate/pay/route.ts`).
- **Payment collection is off.** It now needs both the Razorpay keys *and* `PAYMENTS_ENABLED=true`. Keys alone cannot switch it on. With it off, every pay surface says nothing is charged and gives no payment form. Audience visitors can only join a waitlist.
- Email is not configured, so no shortlisting email goes out; the organiser would share the private pay link by hand.

## The contradictions

| # | Where | Text | Conflicts with |
|---|---|---|---|
| 1 | `/terms` "Seat lock" | "Your registration fee … confirms your seat. A registration is complete **only after payment** is received." | Applying is free and nothing is paid at application. A free application is therefore never "complete" under this clause. |
| 2 | `/terms` "No refunds" | "All fees are non-refundable, including for no-shows, late arrivals and personal cancellations." | `/terms` "If we cancel or postpone": "full refund". The two clauses sit on the same page and the refund page, so the absolute wording is wrong as written. |
| 3 | `/terms` "Payment charges" | "Gateway fees, if any, are not refundable." | Unclear whether this applies when the organiser cancels (clause 2 says full refund). ⚖ |
| 4 | `/terms` vs `/how-it-works` | Terms speak of "registration" as one step. The journey has four: apply, shortlist, pay, attend. | Candidates are told they are "shortlisted for panel fit" but the Terms treat payment as the seat confirmation. |
| 5 | `/refund-policy` | Header says "being finalised before any payment is taken." | Fine as a draft notice, but it repeats clauses 2 and 3 verbatim, so it inherits their conflict. |
| 6 | Recording / media | One clause covers filming and publication. | The site (correctly) separates participation consent from media consent. The Terms summary must match. ⚖ |

## Four stages, defined once

Use these four words consistently on every page, form and email:

1. **Application** — a candidate submits the free form. No money, no seat. Receiving an application does not promise a place, an interview, or an internship.
2. **Shortlisting** — the panel selects who may take part. This is a decision by The Believing Room, not an entitlement.
3. **Seat confirmation** — a shortlisted candidate (or an audience member) pays the fee and the payment is verified by the provider. Only now is a seat confirmed.
4. **Payment** — the fee itself (₹500 / ₹300), taken only through the verified provider, after the terms are final.

## Proposed wording (for your approval and legal review)

**Seat lock (replace):** "Applying is free. If you are shortlisted, you will be asked to pay the registration fee (₹500 for candidates, ₹300 for audience members). Your seat is confirmed only when that payment has been received and verified. Being shortlisted does not guarantee an internship or an offer."

**Refunds (replace the "No refunds" clause, keep the cancel/postpone clause):** "Fees are non-refundable if you choose not to attend, arrive late, or cancel, except where we cancel or postpone the event (see below) or where the law requires otherwise." ⚖ The "except where the law requires" wording matters for consumer protection; have a lawyer confirm it.

**If we cancel or postpone (keep):** "If we cancel, you get a full refund. If we postpone, you can choose a full refund or keep your seat for the new date." Decide the refund time limit (for example 7 working days) and add it.

**Payment charges (clarify):** "If we cancel the event, we refund the full amount you paid, including any gateway fee we are able to recover." Decide whether you will absorb gateway fees on cancellation.

## Decisions I need from you

1. Confirm payment stage: **after shortlisting** (current) or at application. This also decides whether anything is charged to applicants who are never shortlisted.
2. Approve the "Seat lock" and refund wording above, or give your own.
3. Refund time limit and who pays gateway fees on a cancellation.
4. Whether the ₹500 fee is for participation only or also covers anything else (do not promise goods or "goodies" that are not confirmed).
5. A GST/invoice position for fees collected. ⚖ (accounting advice, not a site setting.)

## Legally significant clauses to send to a professional ⚖

- Non-refundable fee wording and its exceptions (consumer protection law).
- Transfer of registration, including candidate approval rights.
- Recording, publication and promotion consent, and use of image and voice of participants; the separate media-consent page.
- Participants must be 18+: how age is verified, and handling of minors.
- Data protection for student applications (India's DPDP Act): purposes, retention, erasure and the privacy notice.
- Wording about internships, offers and "selection". Nothing may imply a guaranteed internship or placement.
- Partner and sponsor statements: no endorsement or sponsorship may be implied without written permission.

## What must be true before payments are switched on

1. Razorpay (or another provider) account is verified and settlement bank details are confirmed.
2. This document's decisions are made and `/terms`, `/refund-policy`, `/how-it-works` and the forms say the same thing.
3. Lawyer has reviewed the ⚖ items.
4. A test payment, refund and webhook have been run in the provider's **test mode**, then a small live payment checked.
5. Only then set `PAYMENTS_ENABLED=true` in the production environment.
