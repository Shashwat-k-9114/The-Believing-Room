import type { Metadata } from "next";
import { CollegeForm } from "@/components/forms/EnquiryForms";
import { ListRows, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "For colleges",
  description: "Bring your students to a live internship pitching stage. Coordinated registrations, industry exposure and campus outreach.",
  alternates: { canonical: "/for-colleges" },
};

export default function ForColleges() {
  return (
    <PageShell
      eyebrow="For colleges"
      title={<>Give your students <em>a room</em> to be seen in.</>}
      lede="Placement cells open doors; this opens a stage. Your students pitch to industry panels and meet the people who hire."
    >
      <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <ListRows
            items={[
              { title: "Student participation", body: "Students apply individually, in any of the four disciplines. A college can encourage and coordinate, not select on their behalf." },
              { title: "Industry interaction", body: "Direct exposure to hiring managers and founders, in a format that rewards preparation." },
              { title: "Coordinated registrations", body: "We can discuss group arrangements for audience attendance. Terms are agreed per edition." },
              { title: "Campus outreach", body: "Briefing sessions for interested students, if your institution would like one." },
            ]}
          />
          <div className="prose-arena mt-10">
            <h2>Honest expectations</h2>
            <p>Participation does not guarantee any student a slot, an offer or a placement. We will not publish a student’s name, college or pitch without that student’s own permission, even if the college has partnered with us.</p>
          </div>
        </div>
        <div className="glass glass-frost p-7 sm:p-10 [--r:1.8rem]">
          <h2 className="display text-4xl">College enquiry</h2>
          <p className="mb-8 mt-2 text-[var(--fg-dim)]">Placement officers, faculty and administrators: tell us about your institution.</p>
          <CollegeForm />
        </div>
      </div>
    </PageShell>
  );
}
