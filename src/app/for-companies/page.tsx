import type { Metadata } from "next";
import { CompanyForm } from "@/components/forms/EnquiryForms";
import { ListRows, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "For companies",
  description: "Meet motivated student talent through live, portfolio-based pitching sessions. Hire interns, sit on a panel, or partner with the show.",
  alternates: { canonical: "/for-companies" },
};

export default function ForCompanies() {
  return (
    <PageShell
      eyebrow="For companies"
      title={<>See the work <em>before</em> the interview.</>}
      lede="A short pitch and live questions tell you more about an intern than a résumé screen. Join a panel, or tell us the functions you want to meet candidates for."
    >
      <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <ListRows
            items={[
              { title: "Motivated, self-selected talent", body: "Students apply because they want to be on stage. That is a useful filter in itself." },
              { title: "Domain-specific sessions", body: "Four arenas, each with its own format: live demos, model walkthroughs, campaign teardowns, reels." },
              { title: "Portfolio-based evaluation", body: "You see the thing they made and hear them defend it. Applications include links and an optional PDF résumé." },
              { title: "Early talent discovery", body: "Meet candidates before they are on every other hiring list." },
              { title: "Panel seats", body: "Sit on an industry panel and question candidates live. Confirmed panelists are named publicly only with agreement." },
              { title: "Visibility, by agreement", body: "Media exposure and branding are possible but are agreed individually. No reach or audience numbers are promised." },
            ]}
          />
          <div className="prose-arena mt-10">
            <h2>What we won’t promise</h2>
            <p>We don’t guarantee a number of candidates, a hiring outcome, or any audience size. Hiring decisions, stipends and terms are entirely yours. There is no placement fee in this enquiry; commercial terms for any sponsorship are agreed separately in writing.</p>
          </div>
        </div>
        <div className="glass glass-frost p-7 sm:p-10 [--r:1.8rem]">
          <h2 className="display text-4xl">Partnership enquiry</h2>
          <p className="mb-8 mt-2 text-[var(--fg-dim)]">Tell us what you’re hiring for. We’ll reply by email.</p>
          <CompanyForm />
        </div>
      </div>
    </PageShell>
  );
}
