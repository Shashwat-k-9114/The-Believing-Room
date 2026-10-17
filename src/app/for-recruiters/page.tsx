import type { Metadata } from "next";
import { CompanyForm } from "@/components/forms/EnquiryForms";
import { ListRows, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "For recruiters",
  description: "Meet shortlisted early-career talent, watch candidates present live and decide on your own terms. Apply as a recruiter for Season 01.",
  alternates: { canonical: "/for-recruiters" },
};

export default function ForRecruiters() {
  return (
    <PageShell
      eyebrow="For recruiters"
      title={<>See talent <em>in action.</em></>}
      lede="Meet a shortlisted pool of motivated candidates without spending weeks screening hundreds of applications. Watch them present, ask your own questions, and decide on your own terms."
    >
      <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <ListRows
            items={[
              { title: "Access to early-career talent", body: "Candidates apply because they want to be heard. Our team shortlists them for panel fit." },
              { title: "Live, domain-specific evaluation", body: "Four disciplines: IT & Technology, Finance & Accounting, Sales & Marketing, Animation & Multimedia." },
              { title: "Portfolio and presence together", body: "You see the work, hear the thinking and judge communication in one sitting." },
              { title: "Hiring conversations", body: "Speak with candidates you want to continue with, directly, during or after the show." },
              { title: "Visibility, by agreement", body: "Participation in filmed content and any branding are agreed individually. No audience figures or reach are promised." },
            ]}
          />
          <div className="prose-arena mt-10">
            <h2>What we won’t promise</h2>
            <p>We don’t guarantee a number of candidates, their quality, a hiring outcome or any audience size. Offers, stipends and terms are entirely yours. Companies are named on this site only once they have confirmed their participation.</p>
          </div>
        </div>
        <div className="glass glass-frost p-7 sm:p-10 [--r:1.2rem]">
          <h2 className="display text-4xl">Apply as a recruiter</h2>
          <p className="mb-8 mt-2 text-[var(--fg-dim)]">Tell us what you are hiring for. We reply by email.</p>
          <CompanyForm />
        </div>
      </div>
    </PageShell>
  );
}
