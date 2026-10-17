import type { Metadata } from "next";
import { DraftNotice, ListRows, PageShell, Prose } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Filming and media consent", description: "How the event is filmed and the separate permissions candidates are asked for.", alternates: { canonical: "/media-consent" } };

export default function MediaConsent() {
  return (
    <PageShell eyebrow="Legal" title={<>Filming and <em>media consent.</em></>} lede="The show is filmed and published on YouTube and social media. Being recorded and being published are different things, so we ask for each one separately.">
      <DraftNotice>The original page asks for a single consent covering recording, publication and promotion. This build splits it into four. Counsel should confirm the wording.</DraftNotice>
      <ListRows
        items={[
          { title: "1. Recording", body: "You allow us to film or record you if you pitch. Recording alone does not allow publication." },
          { title: "2. Publishing your pitch", body: "You allow the recorded pitch to be published on the YouTube channel and, where relevant, the podcast feed." },
          { title: "3. Showing your name and college", body: "You allow your name and college to be shown with published content." },
          { title: "4. Promotional clips", body: "You allow short clips to be used in promotion and on social media." },
        ]}
      />
      <div className="mt-12"><Prose>
        <h2>Audience members</h2>
        <p>The event is filmed, and audience members may appear in the background of recordings. This is acknowledged when buying a ticket.</p>
        <h2>Withdrawing</h2>
        <p>You may withdraw a permission at any time through the <a href="/contact">contact page</a>. We will remove the content from our channels going forward; we cannot recall copies already shared by others.</p>
        <h2>What we never do</h2>
        <p>Publish names, projects, identifiable footage or applicant information without the relevant permission.</p>
      </Prose></div>
    </PageShell>
  );
}
