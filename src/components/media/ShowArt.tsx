import { Reveal } from "../liquid/Reveal";

/**
 * Founder-supplied show artwork (see brand-source/ and docs/BRAND-ASSETS.md).
 * Used only where its detail can be seen: the show page. Never as a heading decoration.
 * The artwork contains lettering, so the same words also exist as real HTML text next to it.
 */
type Art = { base: string; w: number; h: number; sizes: string; alt: string; small: number; large: number };

const EMBLEM: Art = {
  base: "/brand/show-emblem", w: 1024, h: 1024, small: 640, large: 1024,
  sizes: "(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 90vw",
  alt: "The Believing Room emblem: a golden letter B with a microphone and a necktie, on a lit stage with purple curtains.",
};
const WORDMARK: Art = {
  base: "/brand/show-wordmark", w: 1408, h: 768, small: 704, large: 1408,
  sizes: "(min-width: 1024px) 40rem, 92vw",
  alt: "Show artwork for The Believing Room on a spotlit stage; the letter i in Believing is a necktie and the letter i in the middle of the word is a microphone.",
};

function Picture({ art, className = "" }: { art: Art; className?: string }) {
  const { base, small, large } = art;
  return (
    <picture>
      <source type="image/webp" srcSet={`${base}-${small}.webp ${small}w, ${base}-${large}.webp ${large}w`} sizes={art.sizes} />
      <img
        src={`${base}-${large}.jpg`}
        srcSet={`${base}-${small}.jpg ${small}w, ${base}-${large}.jpg ${large}w`}
        sizes={art.sizes}
        width={art.w}
        height={art.h}
        alt={art.alt}
        loading="lazy"
        decoding="async"
        className={`block h-auto w-full ${className}`}
      />
    </picture>
  );
}

/** The show's visual identity, with its meaning stated in text. Two pieces of artwork, each shown large enough to read. */
export function ShowIdentity() {
  return (
    <section aria-labelledby="show-identity" className="mb-24">
      <p className="eyebrow mb-4">The stage</p>
      <h2 id="show-identity" className="display h-lg max-w-[22ch]">A room built for being <em>seen.</em></h2>
      <p className="lede mt-5 max-w-[40rem]">
        The show’s artwork pairs a necktie with a microphone, with a gold B at its centre. That B, simplified, is the mark you will see in your browser tab.
      </p>
      <div className="mt-10 grid items-center gap-6 lg:grid-cols-[1.45fr_1fr]">
        <Reveal>
          <figure className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#1b1224] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.8)]">
            <Picture art={WORDMARK} />
          </figure>
        </Reveal>
        <Reveal>
          <figure className="mx-auto w-full max-w-[26rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#1b1224] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.8)]">
            <Picture art={EMBLEM} />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
