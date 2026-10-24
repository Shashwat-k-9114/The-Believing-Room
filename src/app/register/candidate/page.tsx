import type { Metadata } from "next";
import { formatINR, pricing } from "@/config/site";
import { CandidateForm } from "@/components/forms/CandidateForm";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Apply as a candidate",
  description: "Apply to pitch to industry panels at The Believing Room. Applying is free; the candidate ticket (₹1,000, food and goodies included) is requested on shortlisting.",
  alternates: { canonical: "/register/candidate" },
};

export default async function CandidateRegistration({ searchParams }: { searchParams: Promise<{ industry?: string }> }) {
  const { industry } = await searchParams;
  const after = pricing.candidatePaymentStage === "after_shortlist";
  const price = formatINR(pricing.candidate.amount);
  return (
    <PageShell
      eyebrow="Candidate registration"
      title={<>Be heard <em>in the room.</em></>}
      lede={`${after ? `Applying is free. Shortlisted candidates confirm with a ${price} ticket, food and goodies included.` : `The candidate ticket is ${price}, food and goodies included.`} No offer is guaranteed: selection is the panel’s decision.`}
      art="candidate"
    >
      <div className="mx-auto max-w-3xl">
        <CandidateForm defaultIndustry={industry} />
      </div>
    </PageShell>
  );
}
