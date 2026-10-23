/** Simple monoline social marks. The icon set in use has no brand logos, so these are drawn here. */
type Name = "youtube" | "instagram" | "linkedin" | "x" | "reddit";

export function BrandIcon({ name, size = 22 }: { name: Name; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (name) {
    case "youtube":
      return (
        <svg {...common} fill="currentColor">
          <path fillRule="evenodd" d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.2 22 12 22 12s0-3.2-.4-4.8ZM10 15V9l5.2 3Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common} fill="currentColor">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.54h.05c.53-1 1.83-2.04 3.77-2.04 4.03 0 4.78 2.65 4.78 6.1V21h-4v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.58V21h-4V9.75Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common} fill="currentColor">
          <path d="M17.53 3H20.4l-6.27 7.17L21.5 21h-5.77l-4.52-5.9L6.03 21H3.15l6.7-7.66L2.8 3h5.92l4.08 5.4L17.53 3Zm-1 16.3h1.6L7.84 4.6H6.12l10.41 14.7Z" />
        </svg>
      );
    case "reddit":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="14" rx="7.5" ry="5.2" />
          <circle cx="9.3" cy="13.4" r="0.9" fill="currentColor" />
          <circle cx="14.7" cy="13.4" r="0.9" fill="currentColor" />
          <path d="M9.5 16.3c1.4.9 3.6.9 5 0" />
          <path d="M12 8.8 13 4l4 1" />
          <circle cx="18.2" cy="5.4" r="1.3" />
          <circle cx="4.4" cy="11.6" r="1.4" />
          <circle cx="19.6" cy="11.6" r="1.4" />
        </svg>
      );
  }
}
