"use client";

/* ============================================================================
   LiquidButton — a primary CTA whose fill is the live liquid-metal shader
   (same material + indigo as the logo). The label rides on top with a soft
   shadow for legibility. Falls back to the flat brand colour where WebGL is
   unavailable (the .btn-liquid base background).
   ========================================================================== */

import Link from "next/link";
import LiquidMetal from "./LiquidMetal";

export default function LiquidButton({
  href,
  children,
  className = "",
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Link href={href} className={`btn btn-liquid ${className}`} style={style}>
      <LiquidMetal />
      <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 8 }}>
        {children}
      </span>
    </Link>
  );
}
