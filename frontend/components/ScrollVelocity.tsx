"use client";

/* ============================================================================
   ScrollVelocity — a marquee row whose speed and direction respond to the
   user's scroll velocity (componentry.fun "scroll based velocity" pattern,
   built on Framer Motion). Tasteful, low-contrast band of repeating labels.
   ========================================================================== */

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  wrap,
} from "framer-motion";

function Row({ children, baseVelocity }: { children: React.ReactNode; baseVelocity: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });

  // wrap across one repeated copy (4 copies rendered → 25%)
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    let move = dir.current * baseVelocity * (delta / 1000);
    if (factor.get() < 0) dir.current = -1;
    else if (factor.get() > 0) dir.current = 1;
    move += dir.current * move * factor.get();
    baseX.set(baseX.get() + move);
  });

  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", display: "flex", flexWrap: "nowrap" }}>
      <motion.div style={{ x, display: "flex", flexWrap: "nowrap", gap: 0 }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ display: "block", marginRight: 0 }}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function ScrollVelocity({
  items,
  baseVelocity = 2,
}: {
  items: string[];
  baseVelocity?: number;
}) {
  // pause when reduced motion is requested
  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const content = (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {items.map((t, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: i % 2 === 1 ? 600 : 500,
              fontSize: "clamp(24px, 4vw, 50px)",
              letterSpacing: "-0.035em",
              color: i % 2 === 1 ? "var(--ink)" : "var(--ink-3)",
              padding: "0 22px",
            }}
          >
            {t}
          </span>
          <span aria-hidden className="mono" style={{ color: "var(--brand)", fontSize: "clamp(12px, 1.4vw, 18px)" }}>
            /
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div style={{ userSelect: "none" }}>
      <Row baseVelocity={reduced.current ? 0 : baseVelocity}>{content}</Row>
    </div>
  );
}
