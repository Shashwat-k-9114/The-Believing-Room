"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * An organisation's identity. The official logo is shown only when `logo` is passed, which the server does
 * only after logo permission was recorded as approved. Otherwise (or if the file fails to load) the name is
 * set in type. Logos are never recoloured, cropped or stretched: height is fixed, width follows the artwork.
 */
export function OrgMark({ name, logo, size = "md", className = "" }: { name: string; logo?: string | null; size?: "md" | "lg"; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (logo && !failed) {
    return (
      <Image
        src={logo}
        alt={name}
        width={240}
        height={72}
        unoptimized
        onError={() => setFailed(true)}
        className={`w-auto max-w-[13rem] object-contain ${size === "lg" ? "h-14" : "h-10"} ${className}`}
      />
    );
  }
  return <span className={`display leading-[1.02] ${size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"} ${className}`}>{name}</span>;
}
