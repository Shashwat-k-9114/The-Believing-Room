import type { Metadata } from "next";
import { DraftNotice, PageShell, Prose } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Privacy notice", description: "What personal data we collect, why, who can see it and how to have it removed.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <PageShell eyebrow="Legal" title={<>Privacy <em>notice.</em></>} lede="What we collect, why, who sees it, and how you can have it corrected or deleted.">
      <DraftNotice>Written to reflect how the software actually behaves. A lawyer must review it against India’s Digital Personal Data Protection Act, 2023 before launch, and the data controller’s legal name and address must be added.</DraftNotice>
      <Prose>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Student applications:</strong> name, email, phone, college, course, graduation year, industry, skills, optional links, pitch summary, optional experience and optional PDF résumé.</li>
          <li><strong>Audience orders:</strong> name, email, phone, attendee names, quantity and payment status. Card and bank details are handled by the payment provider and never reach our servers.</li>
          <li><strong>Enquiries and contact messages</strong> from companies, colleges and visitors, and email addresses on waitlists.</li>
          <li><strong>Consent records:</strong> each consent you give or decline, with the time it was recorded.</li>
        </ul>
        <h2>Why</h2>
        <p>To run screening and the event, issue tickets, reply to you, and (only if you agreed separately) publish recorded content. We do not sell personal data.</p>
        <h2>Who can see it</h2>
        <p>Authorised organisers only. Applications and résumés are never shown publicly or through public interfaces. Participating companies receive candidate details only for candidates who agree to be introduced.</p>
        <h2>Service providers</h2>
        <p>A hosting provider, a database provider, an email provider and a payment provider, once each is configured. They process data on our behalf.</p>
        <h2>Retention and deletion</h2>
        <p>Unsuccessful applications and their résumés are intended to be deleted after the retention period set per edition (to be confirmed). You may ask us at any time to delete your application and résumé.</p>
        <h2>Your rights</h2>
        <p>To access, correct or erase your data, or to withdraw a consent, write to us via the <a href="/contact">contact page</a>.</p>
        <h2>Cookies and storage</h2>
        <p>We set no tracking or advertising cookies. Your browser stores a small flag so the intro animation plays once, and, if you choose, a draft of your application on your own device. Video embeds use YouTube’s privacy-enhanced mode and load only when you press play.</p>
      </Prose>
    </PageShell>
  );
}
