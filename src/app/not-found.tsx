import { PageShell } from "@/components/layout/PageShell";
import { LiquidButton } from "@/components/liquid/LiquidButton";

export default function NotFound() {
  return (
    <PageShell
      eyebrow="404"
      title={<>This page isn’t <em>on the program.</em></>}
      lede="The link may be old, or the content isn’t published yet."
      actions={<LiquidButton href="/" variant="primary" size="lg">Back to the stage</LiquidButton>}
    />
  );
}
