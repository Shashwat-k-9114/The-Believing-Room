import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Globe, GraduationCap, Handshake, Mail, MessageSquare, Mic, Ticket } from "lucide-react";
import { BrandIcon } from "@/components/links/BrandIcon";
import { CopyLink, LinksShell } from "@/components/links/LinksShell";
import { brand, socialLinks } from "@/config/site";
import "./links.css";

export const metadata: Metadata = {
  title: "Links",
  description: "Every way to find, follow and reach The Believing Room: apply to pitch, get tickets, hire, partner, watch and say hello.",
  alternates: { canonical: "/links" },
};

const take = [
  { href: "/register/candidate", title: "Apply to pitch", note: "Free to apply. Stand up in front of industry panels.", icon: Mic, featured: true },
  { href: "/register/audience", title: "Audience tickets", note: "Be in the room. Food and goodies included.", icon: Ticket },
  { href: "/for-recruiters", title: "Hire with us", note: "Meet early-career talent in person.", icon: Handshake },
  { href: "/sponsors", title: "Partner or sponsor", note: "Help make opportunity visible.", icon: Handshake },
  { href: "/for-colleges", title: "Bring your college", note: "Send your students to be heard.", icon: GraduationCap },
] as const;

const SOCIAL_ICON = { youtube: "youtube", instagram: "instagram", linkedin: "linkedin", x: "x", reddit: "reddit" } as const;

/** Spark positions on the stage. Fixed, so server and client agree. */
const SPARKS = [
  { l: "9%", t: "22%", d: "0s" }, { l: "21%", t: "64%", d: "1.1s" }, { l: "47%", t: "14%", d: "0.5s" },
  { l: "63%", t: "58%", d: "1.7s" }, { l: "81%", t: "26%", d: "0.9s" }, { l: "93%", t: "70%", d: "2.3s" },
];

export default function LinksPage() {
  // Entrance order: each element takes the next slot, so the stagger follows reading order.
  let n = 0;
  const step = () => ({ ["--i" as string]: n++ }) as React.CSSProperties;
  const site = (() => { try { return new URL(brand.url).host; } catch { return brand.name; } })();
  return (
    <LinksShell>
      <div aria-hidden className="links-glow" />

      <header className="links-stage">
        <picture>
          <source type="image/webp" srcSet="/brand/tbr-banner-1000.webp 1000w, /brand/tbr-banner-2000.webp 2000w" sizes="100vw" />
          <img src="/brand/tbr-banner-1000.jpg" width={1000} height={333} alt="The Believing Room: Where Talent Meets Opportunity" fetchPriority="high" className="links-banner" />
        </picture>
        <span aria-hidden className="links-beam" />
        {SPARKS.map((s, i) => <span key={i} aria-hidden className="links-spark" style={{ left: s.l, top: s.t, animationDelay: s.d }} />)}
        <span aria-hidden className="links-stage-fade" />
        <div className="links-share lk" style={step()}><CopyLink /></div>
      </header>

      <div className="links-main">
        <div className="links-id">
          <div className="links-avatar lk" style={step()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size logo, already optimised */}
            <img src="/brand/show-emblem-640.webp" width={640} height={640} alt="The Believing Room logo" />
          </div>
          <h1 className="display lk" style={step()}>The Believing <em>Room</em></h1>
          <p className="links-tag lk" style={step()}>Where Opportunity Meets Belief.</p>
          <p className="links-bio lk" style={step()}>
            A live recruitment show where students pitch their skills, projects and potential straight to industry professionals. Filmed for YouTube, with a podcast to follow.
          </p>
          <ul className="links-facts lk" style={step()} aria-label="At a glance">
            <li>Live pitches</li><li>Multiple industries</li><li>Filmed for YouTube</li><li>Season 01</li>
          </ul>
        </div>

        <section aria-labelledby="lk-take" className="links-block">
          <p id="lk-take" className="eyebrow lk" style={step()}>Take your place</p>
          <ul className="links-list">
            {take.map(({ href, title, note, icon: Icon, ...rest }) => (
              <li key={href + title} className="lk" style={step()}>
                <Link href={href} className={`lk-card ${"featured" in rest ? "is-featured" : ""}`}>
                  <span className="lk-icon"><Icon size={20} aria-hidden /></span>
                  <span className="lk-text"><span className="lk-title">{title}</span><span className="lk-note">{note}</span></span>
                  <ArrowUpRight className="lk-arrow" size={20} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="lk-follow" className="links-block">
          <p id="lk-follow" className="eyebrow lk" style={step()}>Follow along</p>
          <ul className="links-grid">
            <li className="lk lk-wide" style={step()}>
              <Link href="/" className="lk-card lk-tile">
                <span className="lk-icon"><Globe size={20} aria-hidden /></span>
                <span className="lk-text"><span className="lk-title">Website</span><span className="lk-note">{site}</span></span>
                <ArrowUpRight className="lk-arrow" size={18} aria-hidden />
              </Link>
            </li>
            {socialLinks.map((s, i) => (
              // An odd one out takes the full row rather than sitting alone beside a gap.
              <li key={s.key} className={`lk ${i % 2 === 0 && i === socialLinks.length - 1 ? "lk-wide" : ""}`} style={step()}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="lk-card lk-tile">
                  <span className="lk-icon"><BrandIcon name={SOCIAL_ICON[s.key]} size={20} /></span>
                  <span className="lk-text"><span className="lk-title">{s.label}</span><span className="lk-note">{s.handle}</span></span>
                  <ArrowUpRight className="lk-arrow" size={18} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="lk-touch" className="links-block">
          <p id="lk-touch" className="eyebrow lk" style={step()}>Get in touch</p>
          <ul className="links-grid">
            <li className="lk lk-wide" style={step()}>
              <a href={`mailto:${brand.contactEmail}`} className="lk-card lk-tile">
                <span className="lk-icon"><Mail size={20} aria-hidden /></span>
                <span className="lk-text"><span className="lk-title">Email</span><span className="lk-note">{brand.contactEmail}</span></span>
                <ArrowUpRight className="lk-arrow" size={18} aria-hidden />
              </a>
            </li>
            <li className="lk lk-wide" style={step()}>
              <Link href="/contact" className="lk-card lk-tile">
                <span className="lk-icon"><MessageSquare size={20} aria-hidden /></span>
                <span className="lk-text"><span className="lk-title">Send a message</span><span className="lk-note">Every one is read by a person</span></span>
                <ArrowUpRight className="lk-arrow" size={18} aria-hidden />
              </Link>
            </li>
          </ul>
        </section>

        <section aria-labelledby="lk-about" className="links-about lk" style={step()}>
          <p id="lk-about" className="eyebrow">In brief</p>
          <p className="display">Students pitch. Professionals listen. <em>Opportunity</em> gets seen.</p>
          <p>
            The Believing Room brings early-career talent and hiring teams into one room across four industries: IT &amp; Technology, Finance &amp; Accounting, Sales &amp; Marketing, and Animation &amp; Multimedia.
            Season 01 is in preparation, and the date and venue will be announced once confirmed. It is not a job board, and no placement is promised.
          </p>
          <Link href="/about" className="link-u">Read our belief</Link>
        </section>

        <footer className="links-foot lk" style={step()}>
          <Link href="/" className="link-u">Visit the full website</Link>
          <p>© 2026 {brand.name}</p>
        </footer>
      </div>
    </LinksShell>
  );
}
