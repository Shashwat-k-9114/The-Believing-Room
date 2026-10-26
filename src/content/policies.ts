/**
 * Registration terms as stated on the reference page (the-believing-room-clean-header-terms.html).
 * They are preserved here as DRAFT policy and must be reviewed by counsel and confirmed by the
 * organiser before launch. Rows marked `needsDecision` conflict with, or go beyond, the source.
 */
export interface PolicyItem {
  id: string;
  title: string;
  body: string;
  needsDecision?: string;
}

export const registrationTerms: PolicyItem[] = [
  {
    id: "seat-lock",
    title: "Seat lock",
    body: "Season 01 tickets are free for candidates and audience. A registration confirms your seat once we have written to you to confirm it.",
  },
  { id: "no-refunds", title: "No refunds", body: "All fees are non-refundable, including for no-shows, late arrivals and personal cancellations." },
  {
    id: "transfers",
    title: "Transfers",
    body: "You can transfer your registration to another person up to 48 hours before the show. Email us the new person’s name and contact details before the deadline. No transfers are accepted after that.",
  },
  {
    id: "candidate-transfers",
    title: "Candidate transfers",
    body: "A candidate slot can be transferred only if the new person is approved by The Believing Room team, since candidates are shortlisted for panel fit.",
  },
  {
    id: "cancel-postpone",
    title: "If we cancel or postpone",
    body: "If we cancel, you get a full refund. If we postpone, you can choose a full refund or keep your seat for the new date.",
  },
  {
    id: "included",
    title: "What’s included",
    body: "Food for all attendees, and panel review and guidance for all candidates. An offer letter for selected candidates only. Selection depends entirely on the panel’s decision, and registration does not guarantee an offer.",
    needsDecision: "The source says “lunch and goodies”. Goodies are unconfirmed and are not shown publicly. The owner confirmed ‘food and goodies included’ only.",
  },
  {
    id: "recording",
    title: "Recording",
    body: "The show is filmed and published on YouTube and social media. Publication of a participant’s image, voice and performance depends on the separate permissions described on the media consent page.",
    needsDecision: "The source bundles recording, publication and promotion into one consent. This build records them separately; counsel should confirm.",
  },
  { id: "arrival", title: "Arrival", body: "Please arrive at the time on your confirmation. Late arrivals may lose their slot or seat without refund." },
  { id: "conduct", title: "Conduct", body: "Respectful behaviour is required. We may remove anyone who disrupts the show or disrespects candidates, panelists or staff, with no refund." },
  { id: "eligibility", title: "Eligibility and ID", body: "Participants must be 18 or older and carry valid photo ID." },
  { id: "gateway", title: "Payment charges", body: "Payment gateway fees, if any, are not refundable." },
  { id: "changes", title: "Changes", body: "We may update the schedule, venue or panel if needed, and we will inform registered participants." },
];
