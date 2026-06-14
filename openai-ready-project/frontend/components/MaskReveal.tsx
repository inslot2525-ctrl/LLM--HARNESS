"use client";

/* ============================================================================
   MaskReveal — line-by-line "rise out of a mask" reveal for headings.
   Each line sits in an overflow-hidden track and slides up from below with a
   stagger. Drives off scroll (whileInView) by default, or off a `play` flag
   (used by the hero so it fires only after the intro docks).
   ========================================================================== */

import { motion, type Variants } from "framer-motion";

interface Line { t: string; accent?: boolean }

interface MaskRevealProps {
  lines: Line[];
  className?: string;
  play?: boolean;        // when provided, drives the animation instead of scroll
  baseDelay?: number;
  style?: React.CSSProperties;
}

const lineV: Variants = {
  hidden: { y: "115%" },
  show: (i: number) => ({
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: i * 0.09 },
  }),
};

export default function MaskReveal({ lines, className = "", play, baseDelay = 0, style }: MaskRevealProps) {
  const driver =
    play === undefined
      ? ({ initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-80px" } } as const)
      : ({ initial: "hidden", animate: play ? "show" : "hidden" } as const);

  return (
    <span
      className={className}
      aria-label={lines.map((l) => l.t).join(" ")}
      style={{ display: "block", ...style }}
    >
      {lines.map((ln, i) => (
        <span key={i} aria-hidden="true" style={{ display: "block", overflow: "hidden", paddingBottom: "0.04em" }}>
          <motion.span
            className={ln.accent ? "accent" : undefined}
            style={{ display: "block", willChange: "transform" }}
            custom={i + baseDelay / 0.09}
            variants={lineV}
            {...driver}
          >
            {ln.t}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
