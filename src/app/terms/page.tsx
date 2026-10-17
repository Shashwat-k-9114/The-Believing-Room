import type { Metadata } from "next";
import { formatINR, pricing } from "@/config/site";
import { DraftNotice, PageShell, Prose } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Terms", description: "Participation and ticket terms, including what a pass does and does not include.", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <PageShell eyebrow="Legal" title={<>Participation <em>terms.</em></>} lede="Plain statements of what registration, screening, passes and hiring each mean.">
      <DraftNotice />
      <Prose>
        <h2>1. What this is</h2>
        <p>An independent live pitching event and media project. It is not affiliated with any television programme. The organisers’ legal name and address will be added before launch.</p>
        <h2>2. Registration, screening, participation and hiring are different</h2>
        <ul>
          <li><strong>Registration</strong> (applying) is free and gives no right to a slot.</li>
          <li><strong>Screening</strong> is decided by the organisers on published criteria. Their decision on who pitches is final for that edition.</li>
          <li><strong>Participation</strong> follows shortlisting and confirmation of the Student Pass.</li>
          <li><strong>Hiring</strong> is solely the decision of each company. The organisers make no promise of an internship, offer, stipend or placement.</li>
        </ul>
        <h2>3. Prices</h2>
        <p>Student Pass {formatINR(pricing.student.amount)}; Audience Pass {formatINR(pricing.audience.amount)}. Food is included in both. Prices are shown inclusive of the taxes and fees configured at the time of purchase. A pass buys a place and meals only. It does not buy selection, a pitching slot or any outcome.</p>
        <h2>4. Eligibility and conduct</h2>
        <p>Pitchers must be enrolled students or recent graduates as specified for the edition, and must present their own work accurately. Misrepresenting work or conduct that disrupts the event may lead to removal without refund.</p>
        <h2>5. Filming</h2>
        <p>The event may be recorded. Publication of a participant’s pitch, name, college and promotional clips each require that participant’s separate consent. See <a href="/media-consent">media consent</a>.</p>
        <h2>6. Changes and cancellation</h2>
        <p>Dates, venues and formats may change. See the <a href="/refund-policy">refund policy</a>.</p>
        <h2>7. Governing law</h2>
        <p>To be confirmed with legal counsel (expected: laws of India, with a stated jurisdiction).</p>
      </Prose>
    </PageShell>
  );
}
