import type { Metadata } from "next";
import { CandidateForm } from "@/components/forms/CandidateForm";
import { brand, submissionsOpen, SUBMISSIONS_CLOSED_MESSAGE } from "@/config/site";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Apply as a candidate",
  description: "Apply to pitch to industry panels at The Believing Room. Applying is free, and so is the candidate ticket, food and goodies included.",
  alternates: { canonical: "/register/candidate" },
};

export default async function CandidateRegistration({ searchParams }: { searchParams: Promise<{ industry?: string }> }) {
  const { industry } = await searchParams;
  return (
    <PageShell
      eyebrow="Candidate registration"
      title={<>Be heard <em>in the room.</em></>}
      lede="Applying is free, and so is the candidate ticket, food and goodies included. No offer is guaranteed: selection is the panel’s decision."
      art="candidate"
    >
      <div className="mx-auto max-w-3xl">
        {submissionsOpen.candidate ? <CandidateForm defaultIndustry={industry} /> : (
          <p role="status" className="mx-auto max-w-3xl rounded-2xl border border-white/15 p-6 text-center">{SUBMISSIONS_CLOSED_MESSAGE} <a className="underline" href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a></p>
        )}
      </div>
    </PageShell>
  );
}
