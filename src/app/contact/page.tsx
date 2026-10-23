import type { Metadata } from "next";
import { brand } from "@/config/site";
import { ContactForm } from "@/components/forms/EnquiryForms";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions from students, parents, companies, colleges and media.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <PageShell eyebrow="Contact" title={<>Say <em>hello.</em></>} lede="Students, parents, companies, colleges, press: every message is read by a person.">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass glass-frost p-7 sm:p-10 [--r:1.8rem]"><ContactForm /></div>
        <div className="prose-arena">
          <h2>Direct</h2>
          {brand.contactEmail ? <p><a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a></p> : <p>A public email address and phone number will be listed here once they are set up. Until then, use the form.</p>}
          <p>Every channel in one place: <a href="/links">all our links</a>.</p>
          <h2>For parents</h2>
          <p>Read the <a href="/faq">FAQ</a>, the <a href="/terms">terms</a> and the <a href="/refund-policy">refund policy</a>. Nothing is charged to apply, and a ticket never promises an internship.</p>
        </div>
      </div>
    </PageShell>
  );
}
