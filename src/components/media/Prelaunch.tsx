import { brand } from "@/config/site";
import { RegistrationGate } from "../forms/RegistrationGate";
import { WaitlistForm } from "../forms/WaitlistForm";
import { LiquidButton } from "../liquid/LiquidButton";

/** Truthful prelaunch state: no fake videos, counts or viewership. */
export function Prelaunch({ what }: { what: string }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="eyebrow">Prelaunch</p>
        <h2 className="display h-lg mt-4">{what} aren’t published yet.</h2>
        <p className="mt-4 max-w-[52ch] text-[var(--fg-dim)]">
          The channel launches with the first edition, and content is published only with participants’ permission. Until then this page stays honest: no placeholder videos, no invented episode counts, no viewer numbers.
        </p>
        {brand.social.youtube && <div className="mt-6"><LiquidButton href={brand.social.youtube} external variant="primary">YouTube channel</LiquidButton></div>}
      </div>
      <div id="notify" className="glass glass-frost p-8 [--r:1.6rem]">
        <p className="eyebrow mb-4">Be told at launch</p>
        <RegistrationGate what="notification list"><WaitlistForm kind="updates" cta="Notify me" note="the first episodes and event announcements" /></RegistrationGate>
      </div>
    </div>
  );
}
