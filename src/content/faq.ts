export interface Faq {
  q: string;
  a: string;
  group: "Basics" | "Money" | "Selection" | "Filming" | "Partners";
}

export const faqs: Faq[] = [
  { group: "Basics", q: "What is this, exactly?", a: "A live pitching event. Students present their abilities and projects to panels of industry professionals, who ask questions and, where they see promise, start internship conversations. Selected sessions are filmed for a YouTube series." },
  { group: "Basics", q: "Is this a TV show?", a: "No. It is an independent event and media project, not affiliated with or licensed from any television programme." },
  { group: "Basics", q: "Who can apply?", a: "Students currently enrolled in a college or university in India, or graduating soon. Eligibility is confirmed per edition." },
  { group: "Money", q: "What does it cost?", a: "Student Pass: ₹500. Audience Pass: ₹300. Food is included in both. Applying to pitch is free; the Student Pass is requested only after you are shortlisted." },
  { group: "Money", q: "Does paying guarantee I will be selected, pitch or get an internship?", a: "No. A pass covers your place and meals. It is not a purchase of selection, a job, an offer or any outcome." },
  { group: "Money", q: "What if the event is cancelled?", a: "See the refund policy. Draft terms are published and will be finalised before ticket sales open." },
  { group: "Selection", q: "How are pitchers chosen?", a: "Applications are screened by the organisers against published criteria for each industry. Being screened in does not guarantee a live slot." },
  { group: "Selection", q: "Who decides on internships?", a: "Participating companies, entirely. The organisers introduce candidates and companies; they do not make or promise hiring decisions." },
  { group: "Selection", q: "Are the internships paid?", a: "That is set by each company. Stipend details will be shown only for openings that companies have confirmed with us." },
  { group: "Filming", q: "Will I be filmed?", a: "The event may be recorded. You choose separately whether your pitch can be published, whether your name and college can be shown, and whether clips can be used in promotion. Saying no does not affect your selection." },
  { group: "Filming", q: "Can I withdraw permission later?", a: "Yes. Write to the contact address and we will remove content from our channels going forward. See the media consent page." },
  { group: "Partners", q: "How can a company take part?", a: "Through the For Companies page. Enquiries are reviewed individually and no outcomes or reach are promised." },
  { group: "Partners", q: "Can a college send its students?", a: "Yes. The For Colleges page explains coordinated registrations. Each student still applies individually." },
];
