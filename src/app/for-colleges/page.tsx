import type { Metadata } from "next";
import { Building2, Megaphone, Presentation, Users } from "lucide-react";
import { CollegeForm } from "@/components/forms/EnquiryForms";
import { FactCards, HonestNote } from "@/components/layout/FactCards";
import { PageShell } from "@/components/layout/PageShell";
import { ShowFlow, type FlowStep } from "@/components/sections/ShowFlow";

export const metadata: Metadata = {
  title: "For colleges",
  description: "Bring your students to a live internship pitching stage. Coordinated registrations, industry exposure and campus outreach.",
  alternates: { canonical: "/for-colleges" },
};

const STEPS: FlowStep[] = [
  { t: "Enquire", d: "Tell us about your institution.", icon: "mail" },
  { t: "Agree", d: "Arrangements are set per edition.", icon: "handshake" },
  { t: "Students apply", d: "Each student applies individually.", icon: "apply" },
  { t: "Attend", d: "Pitch, or watch from the audience.", icon: "watch" },
];

export default function ForColleges() {
  return (
    <PageShell
      eyebrow="For colleges"
      title={<>Give your students <em>a room</em> to be seen in.</>}
      lede="Placement cells open doors. This opens a stage."
      art="college"
    >
      <ShowFlow steps={STEPS} compact label="How colleges take part" />

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div className="grid content-start gap-8">
          <FactCards
            cols={2}
            items={[
              { icon: Users, title: "Students apply themselves", body: "In any of multiple disciplines. A college encourages, it does not select." },
              { icon: Presentation, title: "Industry exposure", body: "Hiring managers and founders, in a format that rewards preparation." },
              { icon: Building2, title: "Group attendance", body: "We can discuss audience groups. Terms are agreed per edition." },
              { icon: Megaphone, title: "Campus briefings", body: "A session for interested students, if you would like one." },
            ]}
          />
          <HonestNote title="Honest expectations">Participation does not guarantee any student a slot, an offer or a placement. We never publish a student’s name, college or pitch without that student’s own permission, even if the college has partnered with us.</HonestNote>
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
