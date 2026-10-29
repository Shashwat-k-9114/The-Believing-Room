"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/**
 * An organisation's identity, set on a paper plate like a slate in a title sequence: registration corners that
 * open on hover, and a fixed aspect so wide and square artwork carry the same weight.
 * The official logo is shown only when `logo` is passed. Otherwise (or if the file fails to load) the name is set in type.
 * Logos are never recoloured, cropped or stretched: they are contained inside the plate with padding.
 */
export function OrgMark({ name, logo, size = "md", onDark = false, href, className = "" }: { name: string; logo?: string | null; size?: "md" | "lg"; onDark?: boolean; href?: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (logo && !failed) {
    // Supplied artwork is drawn for a white ground, so it sits on a white plate in both themes; artwork with white lettering gets a dark plate.
    const plate = `logo-plate ${size === "lg" ? "logo-plate-lg" : ""} ${onDark ? "logo-plate-dark" : ""} ${className}`;
    const image = (
      <Image
        src={logo}
        alt={name}
        fill
        sizes={size === "lg" ? "(min-width: 640px) 18rem, 70vw" : "(min-width: 640px) 12rem, 42vw"}
        unoptimized
        onError={() => setFailed(true)}
        className="object-contain p-[14%]"
      />
    );
    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" title={`${name}: official website`} className={`${plate} logo-plate-link`}>
          {image}
          <ArrowUpRight size={14} aria-hidden className="logo-plate-go" />
        </a>
      );
    }
    return <span className={plate}>{image}</span>;
  }
  return <span className={`display leading-[1.02] ${size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"} ${className}`}>{name}</span>;
}
