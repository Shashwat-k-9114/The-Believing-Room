export interface Faq {
  q: string;
  a: string;
  group: "Basics" | "Money" | "Selection" | "Filming" | "Partners";
}

export const faqs: Faq[] = [
  { group: "Basics", q: "What is The Believing Room?", a: "A live recruitment show. Candidates present their skills to industry professionals, who ask questions and, where they see potential, may offer internships. The event is filmed for YouTube." },
  { group: "Basics", q: "Is this a TV show?", a: "No. It is an independent event and media project, not affiliated with or licensed from any television programme." },
  { group: "Basics", q: "Who can take part as a candidate?", a: "Participants must be 18 or older and carry valid photo ID. Students seeking internships in the four launch disciplines are the focus; further eligibility is confirmed per edition." },
  { group: "Money", q: "What does it cost?", a: "Candidate ticket ₹1,000. Audience ticket ₹300. Food is included with both. Applying as a candidate is free; the candidate ticket is requested after shortlisting, subject to a final owner decision." },
  { group: "Money", q: "Does a ticket guarantee selection or an internship?", a: "No. A ticket confirms your place, food and goodies. Selection depends entirely on the panel’s decision, and registration does not guarantee an offer." },
  { group: "Money", q: "Can I get a refund or transfer my ticket?", a: "Fees are non-refundable, including for no-shows and personal cancellations. You can transfer a registration up to 48 hours before the show. If we cancel, you get a full refund; if we postpone, you can choose a refund or keep your seat. See the refunds page (draft)." },
  { group: "Selection", q: "How are candidates chosen?", a: "Our team reviews applications and shortlists candidates for panel fit. Being shortlisted does not guarantee a live slot." },
  { group: "Selection", q: "Who decides on internships?", a: "Participating companies, entirely. We introduce candidates and companies; we do not make or promise hiring decisions." },
  { group: "Selection", q: "What if I am not selected?", a: "Every candidate who pitches receives panel review and constructive guidance, whatever the result." },
  { group: "Filming", q: "Will I be filmed?", a: "The show is filmed and published on YouTube and social media. You choose separately whether your pitch can be published, whether your name and college can be shown, and whether clips can be used in promotion." },
  { group: "Filming", q: "Can I withdraw permission later?", a: "Yes. Write to us and we will remove content from our channels going forward. See the media consent page." },
  { group: "Partners", q: "How can a company take part?", a: "Through the For Recruiters page. Enquiries are reviewed individually and no outcomes or reach are promised." },
  { group: "Partners", q: "Can a college send its students?", a: "Yes. The For Colleges page explains coordinated participation. Each candidate still applies individually." },
];
