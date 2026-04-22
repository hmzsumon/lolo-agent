/* ── Capitalise Logo (icon, wordmark, full) ─────────────────────────────────── */
"use client";

import React from "react";

type Variant = "icon" | "wordmark" | "full";

export interface CapitaliseLogoProps {
  variant?: Variant; // icon | wordmark | full
  size?: number; // icon box size in px
  color?: string; // wordmark color
  className?: string; // wrapper classes
  wordmarkClassName?: string; // classes for text part
  iconClassName?: string; // classes for svg
  gradient?: boolean; // brand gradient on icon
  ariaLabel?: string;
}

const CapitaliseLogo: React.FC<CapitaliseLogoProps> = ({
  variant = "full",
  size = 28,
  color = "currentColor",
  className = "",
  wordmarkClassName = "",
  iconClassName = "",
  gradient = true,
  ariaLabel = "Capitalise",
}) => {
  const Icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={ariaLabel}
      className={iconClassName}
    >
      <defs>
        <linearGradient id="capitaliseGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* rounded “C” with an open gap using stroke-dash */}
      <circle
        cx="48"
        cy="48"
        r="30"
        fill="none"
        stroke={gradient ? "url(#capitaliseGrad)" : color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="150 80" // ≈ 80 is the gap
        strokeDashoffset="20"
      />
      {/* tiny inner dot for character */}
      <circle
        cx="48"
        cy="48"
        r="4"
        fill={gradient ? "url(#capitaliseGrad)" : color}
      />
    </svg>
  );

  const Wordmark = (
    <span
      className={`select-none whitespace-nowrap text-base font-semibold tracking-wide ${wordmarkClassName}`}
      style={{ color }}
    >
      Capitalise
    </span>
  );

  if (variant === "icon") return <span className={className}>{Icon}</span>;
  if (variant === "wordmark")
    return <span className={className}>{Wordmark}</span>;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {Icon}
      {Wordmark}
    </span>
  );
};

export default CapitaliseLogo;
