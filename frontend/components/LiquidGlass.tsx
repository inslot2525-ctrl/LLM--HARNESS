"use client";

/* ============================================================================
   LiquidGlass — Apple-flavoured "liquid glass" surface (inspired by
   dashersw/liquid-glass-js, reworked as a composable React wrapper).

   The real refraction comes from an SVG feTurbulence → feDisplacementMap
   applied to `backdrop-filter`, so the page *behind* the panel warps at the
   edges like a thick glass lens. Browsers that ignore SVG-in-backdrop still
   get a clean frosted blur, plus a specular rim + soft inner glow on top.

   Render <LiquidGlassFilter /> ONCE near the root, then wrap anything in
   <LiquidGlass>…</LiquidGlass>.
   ========================================================================== */

import React from "react";

export const LIQUID_GLASS_FILTER_ID = "liquid-glass-displace";

/** SVG displacement filter — mount once at the app root. */
export function LiquidGlassFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
      <defs>
        <filter id={LIQUID_GLASS_FILTER_ID} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.013" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.4" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="38" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  /** corner radius in px */
  radius?: number;
  /** backdrop blur in px */
  blur?: number;
  /** glass tint (rgba/hex with alpha) */
  tint?: string;
  /** apply the SVG liquid displacement to the backdrop (default true) */
  liquid?: boolean;
  children?: React.ReactNode;
}

export default function LiquidGlass({
  radius = 20,
  blur = 10,
  tint = "rgba(20,22,32,0.42)",
  liquid = true,
  children,
  style,
  ...rest
}: LiquidGlassProps) {
  return (
    <div
      {...rest}
      style={{
        position: "relative",
        borderRadius: radius,
        background: tint,
        backdropFilter: `${liquid ? `url(#${LIQUID_GLASS_FILTER_ID}) ` : ""}blur(${blur}px) saturate(170%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(170%)`,
        border: "1px solid rgba(255,255,255,0.10)",
        // specular: bright top-left inner edge, soft drop + ambient glow
        boxShadow:
          "inset 0 1px 0 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 -18px 40px -28px rgba(0,0,0,0.7), 0 18px 50px -24px rgba(0,0,0,0.65)",
        isolation: "isolate",
        ...style,
      }}
    >
      {/* sheen — a faint diagonal highlight sweeping the top edge */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 18%, transparent 42%)",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />
      {children}
    </div>
  );
}
