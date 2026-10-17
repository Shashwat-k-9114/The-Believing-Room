/**
 * A single sweeping edge between two sections. `from` is the section above, `to` the
 * section below. Three shapes, so the motif varies rather than repeats.
 */
const SHAPES = {
  swell: "M0 0H1440V30C1100 100 760 110 420 80C240 64 100 40 0 62Z",
  tide: "M0 0H1440V70C1260 20 1080 20 900 56C720 92 560 100 380 64C230 34 110 40 0 74Z",
  arc: "M0 0H1440V0C1440 0 1100 110 720 110C340 110 0 0 0 0Z",
} as const;

export function Curve({ from, to, shape = "swell", flip = false }: { from: string; to: string; shape?: keyof typeof SHAPES; flip?: boolean }) {
  return (
    <div aria-hidden style={{ background: to }} className="relative -mb-px">
      <svg viewBox="0 0 1440 110" preserveAspectRatio="none" className="curve" style={flip ? { transform: "scaleX(-1)" } : undefined}>
        <path d={SHAPES[shape]} fill={from} />
      </svg>
    </div>
  );
}

export const COLOR = { aubergine: "#160f1c", ivory: "#f6f1e9", pearl: "#ede6da" };
