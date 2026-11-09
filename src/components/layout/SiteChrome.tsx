"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The public site's curtain, navigation and footer. The admin portal is a tool, not a page of the site,
 * so it renders on its own.
 */
export function SiteChrome({ before, after, children }: { before: ReactNode; after: ReactNode; children: ReactNode }) {
  const inAdmin = usePathname().startsWith("/admin");
  if (inAdmin) return <main id="main">{children}</main>;
  return (
    <>
      {before}
      <main id="main">{children}</main>
      {after}
    </>
  );
}
