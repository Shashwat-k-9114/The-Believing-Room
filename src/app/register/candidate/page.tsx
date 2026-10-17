import type { Metadata } from "next";
import { formatINR, pricing } from "@/config/site";
import { CandidateForm } from "@/components/forms/CandidateForm";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Apply as a candidate",
  description: "Apply to pitch to industry panels at The Believing Room. Applying is free; the candidate ticket (₹500, food included) is requested on shortlisting.",
  alternates: { canonical: "/register/candidate" },
};

export default async function CandidateRegistration({ searchParams }: { searchParams: Promise<{ industry?: string }> }) {
  const { industry } = await searchParams;
  const after = pricing.candidatePaymentStage === "after_shortlist";
  return (
    <PageShell
      eyebrow="Candidate registration"
      title={<>Be heard <em>in the room.</em></>}
      lede={`${after ? "Applying is free. If you are shortlisted you will be asked to confirm your place" : "You will be asked to confirm your place"} with the candidate ticket (${formatINR(pricing.candidate.amount)}, food included). A ticket does not guarantee an offer: selection depends entirely on the panel’s decision.`}
    >
      <div className="mx-auto max-w-3xl">
        <CandidateForm defaultIndustry={industry} />
      </div>
    </PageShell>
  );
}
