import type { Metadata } from "next";
import { DraftNotice, ListRows, PageShell, Prose } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Filming and media consent", description: "How the event is recorded and the four separate permissions students are asked for.", alternates: { canonical: "/media-consent" } };

export default function MediaConsent() {
  return (
    <PageShell eyebrow="Legal" title={<>Filming and <em>media consent.</em></>} lede="Being recorded and being published are not the same thing. We ask for each separately, and you can say no to any of them.">
      <DraftNotice />
      <ListRows
        items={[
          { title: "1. Recording", body: "You allow us to film or record you if you pitch. Recording alone does not allow publication." },
          { title: "2. Publishing your pitch", body: "You allow the recorded pitch to be published on the YouTube channel (and the podcast feed where relevant)." },
          { title: "3. Showing your name and college", body: "You allow your name and college to be shown with published content. Without this, we blur or omit identifying details where practicable." },
          { title: "4. Promotional clips", body: "You allow short clips to be used in promotion and social media." },
        ]}
      />
      <div className="mt-12"><Prose>
        <h2>No penalty for saying no</h2>
        <p>Declining any permission has no effect on screening, selection or hiring conversations.</p>
        <h2>Audience members</h2>
        <p>The event is filmed. Audience members may appear in the background of recordings; this is acknowledged when buying a ticket. Tell the crew on the day if you would rather not be filmed and we will seat you out of frame where we can.</p>
        <h2>Withdrawing</h2>
        <p>You may withdraw a permission at any time via the <a href="/contact">contact page</a>. We will remove the content from our channels going forward; we cannot recall copies already shared by others.</p>
        <h2>What we never do</h2>
        <p>Publish names, projects, identifiable footage or applicant information without the relevant permission.</p>
      </Prose></div>
    </PageShell>
  );
}
