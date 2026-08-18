"use client";

import React from "react";
import Link from "next/link";

// The signature Finali button: sharp box that morphs to a pill on hover
// (.btn-morph in globals.css). Flat and sharp — no shadows, no scaling,
// no capitalized-only text (design rules 2, 3 and the .gemini/rules set).
type ButtonVariant = "solid" | "contrast" | "soft" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Graphite on white surfaces
  solid: "bg-graphite text-white hover:bg-black",
  // Magenta on plum surfaces (the tone-on-tone CTA)
  contrast: "bg-magenta text-plum hover:bg-white",
  // Quiet gray fill
  soft: "bg-black/5 text-black hover:bg-black/10",
  // Graphite hairline border
  outline: "border border-graphite text-graphite hover:bg-graphite/5",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-5 py-2 text-ui",
  md: "px-6 py-3 text-body",
  lg: "px-8 py-4 text-body",
};

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a link styled as a button */
  href?: string;
  /** Link target, e.g. "_blank" for external spec links */
  target?: string;
  /** Link rel, e.g. "noopener noreferrer" */
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  title?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "solid",
  size = "md",
  href,
  target,
  rel,
  onClick,
  type = "button",
  disabled,
  className = "",
  title,
  children,
}: ButtonProps) {
  const classes = [
    "btn-morph inline-flex items-center justify-center gap-2 font-semibold cursor-pointer",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    // mailto:, tel: and absolute URLs bypass Next's client-side navigation
    const isExternal = /^(mailto:|tel:|https?:\/\/)/.test(href);
    if (isExternal) {
      return (
        <a href={href} target={target} rel={rel} onClick={onClick} title={title} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} target={target} rel={rel} onClick={onClick} title={title} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={classes}>
      {children}
    </button>
  );
}
