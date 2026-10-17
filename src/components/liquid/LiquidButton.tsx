"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import { useJelly, type JellyOptions } from "./useJelly";

type Variant = "primary" | "glass" | "quiet";
type Size = "md" | "lg";

interface Common {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  jelly?: JellyOptions;
}

type ButtonProps = Common & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "children" | "className">;
type AnchorProps = Common & { href: string; external?: boolean } & Omit<ComponentPropsWithoutRef<"a">, "children" | "className" | "href">;

const base =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium select-none touch-manipulation will-change-transform disabled:opacity-50 disabled:pointer-events-none";
const sizes: Record<Size, string> = {
  md: "min-h-12 px-6 text-[0.95rem] [--r:999px]",
  lg: "min-h-14 px-8 text-base [--r:999px]",
};
const variants: Record<Variant, string> = {
  primary: "glass glass-solid",
  glass: "glass text-[var(--fg)]",
  quiet: "text-[var(--fg)] underline-offset-4 hover:underline [--r:999px]",
};

/**
 * Semantic <button> or <a> under a liquid-glass surface.
 * Hover lean, press compression, rebound and ripple come from useJelly.
 */
export function LiquidButton(props: ButtonProps | AnchorProps) {
  const { variant = "glass", size = "md", className = "", children, jelly } = props;
  const { ref, handlers } = useJelly<HTMLElement>(jelly);
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  const inner = <span className="relative z-10 inline-flex items-center gap-2">{children}</span>;

  if ("href" in props && props.href !== undefined) {
    const { href, external, variant: _v, size: _s, className: _c, children: _ch, jelly: _j, ...rest } = props as AnchorProps;
    void _v; void _s; void _c; void _ch; void _j;
    if (external || /^(https?:|mailto:|tel:)/.test(href)) {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={cls}
          {...handlers}
          {...rest}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link ref={ref as Ref<HTMLAnchorElement>} href={href} className={cls} {...handlers} {...rest}>
        {inner}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, jelly: _j, type = "button", ...rest } = props as ButtonProps;
  void _v; void _s; void _c; void _ch; void _j;
  return (
    <button ref={ref as Ref<HTMLButtonElement>} type={type} className={cls} {...handlers} {...rest}>
      {inner}
    </button>
  );
}

/** Primary CTA that is gently drawn toward the pointer before it arrives. */
export function MagneticCTA(props: ButtonProps | AnchorProps) {
  return <LiquidButton variant="primary" size="lg" {...props} jelly={{ pull: 4, magnetRadius: 90, magnetStrength: 9 }} />;
}
