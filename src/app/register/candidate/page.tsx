import type { Metadata } from "next";
import { CandidateForm } from "@/components/forms/CandidateForm";
import { RegistrationCountdown } from "@/components/forms/RegistrationCountdown";
import { PageShell } from "@/components/layout/PageShell";
import { candidateRegistrationOpen, registration } from "@/config/site";

export const metadata: Metadata = {
  title: "Apply as a candidate",
  description: "Apply to pitch to industry panels at The Believing Room. Applying is free, and so is the candidate ticket, food and goodies included.",
  alternates: { canonical: "/register/candidate" },
};

const Closed = () => (
  <div role="status" className="glass glass-frost p-8 sm:p-10 [--r:1.6rem]">
    <p className="eyebrow">Closed</p>
    <h2 className="display mt-3 text-4xl">Candidate registration has closed.</h2>
    <p className="mt-4 text-[var(--fg-dim)]">Thank you for your interest. Follow our channels for the next announcement.</p>
  </div>
);

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
        {!candidateRegistrationOpen() ? (
          <Closed />
        ) : registration.candidateClosesAt ? (
          <RegistrationCountdown closesAt={registration.candidateClosesAt} closed={<Closed />}>
            <CandidateForm defaultIndustry={industry} />
          </RegistrationCountdown>
        ) : (
          <CandidateForm defaultIndustry={industry} />
        )}
      </div>
    </PageShell>
  );
}
