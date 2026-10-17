import type { Metadata } from "next";
import { formatINR, pricing } from "@/config/site";
import { StudentForm } from "@/components/forms/StudentForm";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Apply to pitch",
  description: "Apply to pitch to industry panels. Applying is free; the Student Pass is requested only if you are shortlisted.",
  alternates: { canonical: "/register/student" },
};

export default async function StudentRegistration({ searchParams }: { searchParams: Promise<{ industry?: string }> }) {
  const { industry } = await searchParams;
  return (
    <PageShell
      eyebrow="Student registration"
      title={<>Apply to take <em>the stage.</em></>}
      lede={`Applying is free and is not a purchase. If you are shortlisted you will be asked to confirm your place with the Student Pass (${formatINR(pricing.student.amount)}, food included). Nothing here guarantees selection, a slot or an internship.`}
    >
      <div className="mx-auto max-w-3xl">
        <StudentForm defaultIndustry={industry} />
      </div>
    </PageShell>
  );
}
