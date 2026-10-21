# Founder decision: proposed 20% charge on refunds for ineligible candidates

Status: **PROPOSAL. Not implemented, not approved.** Source: the last lines of the founders' requirements note ("...if you are not eligible your registration fees will be refunded with a 20% charge"). This is not legal advice; items marked (counsel) need an Indian advocate. Payments remain disabled, and nothing on the website mentions this charge.

## What the site does today (verified in code)

- Applying is free. Money is asked only after shortlisting (`pricing.candidatePaymentStage = "after_shortlist"`), by a private pay link. Collection needs both provider keys and `PAYMENTS_ENABLED=true`; neither is set.
- Proposed prices: candidate ₹500, audience ₹300 (configuration, not final).
- `/terms` says all fees are non-refundable and, on the same page, that the organiser refunds in full if it cancels. `/refund-policy` repeats this and says it is "being finalised".

## The ten questions

1. **What does "not eligible" mean?** Undefined. It could mean failing published criteria (age, student status, ID) or simply not being selected by the panel. The founders must choose; the consequences differ greatly.
2. **Why would an ineligible applicant have paid?** Under the current flow they would not: nobody pays before shortlisting, and shortlisting is the eligibility and fit check. The proposal only bites if fees move to the application stage (`at_application`), which is itself an open decision.
3. **Would a fee be collected before shortlisting?** Not today. The 20% rule would force that change and then charge applicants whom the organiser itself decides to reject.
4. **What service justifies keeping 20%?** None is stated. If it is processing cost, it should be the actual cost. If it is a cancellation charge, it must be a reasonable estimate of real loss, and a charge on someone the organiser rejected is hard to explain as loss (counsel).
5. **Is it commercially fair and legally supportable?** Not established. Indian consumer-protection rules treat one-sided terms, penalties and disproportionate cancellation charges with suspicion (counsel). The legal package research (items A04 and A17) is not verified against primary sources.
6. **Does the application form disclose it?** No. The form says nothing about a charge, and a charge first met after payment is the weakest position.
7. **If the organiser cancels?** The terms already promise a full refund. A 20% deduction must not apply here.
8. **If a shortlisted candidate withdraws?** Unspecified. See the alternatives below.
9. **Gateway fees?** `/terms` says gateway fees are not refundable. Whether the organiser absorbs or passes them on is undecided, and they must not be charged twice on top of a flat 20%.
10. **Conflicts?** Yes: with the "non-refundable" clause (the page contradicts itself), with `/refund-policy`, and with the separate media consent. Any deduction would also have to appear identically on the form, the payment screen, the receipt, `/terms` and `/refund-policy`.

## Alternatives for the founders to choose between (none chosen here)

- **A. No fee before shortlisting; full refund if the organiser rejects or cancels; stated rules only for no-shows.** Simplest and consistent with today's flow. There is no deduction for ineligibility because nobody pays before eligibility is decided.
- **B. Fee at shortlisting; fully refundable until a stated cut-off, then a stated percentage or nothing.** The charge attaches to the candidate's own later withdrawal, not to rejection.
- **C. Fee at application, with a flat deduction on ineligibility.** The proposal as written. Highest legal and trust risk. It needs eligibility rules published before payment, an itemised justification for the 20%, and counsel approval.
- **D. No candidate fee at all for season 1.**

## Blocked until the decision is made

Payment collection, any refund automation, and any public wording that states a deduction. Once approved, implementation touches `src/content/policies.ts`, `/refund-policy`, `/terms`, `/register/candidate`, `PayCandidate`, the receipt text, the refund records in `src/lib/payments.ts` and the admin refund screen. Keep the secure release gate (`PAYMENTS_ENABLED`, provider keys and approved terms together). Credentials alone must never switch payments on.

## Register entries

This updates the register entry for the final refund, cancellation and transfer policy (DR-G10 in the legal package) and the candidate entries DR-C01 to DR-C03. The legal drafts currently collect no fee until a policy is final and published.
