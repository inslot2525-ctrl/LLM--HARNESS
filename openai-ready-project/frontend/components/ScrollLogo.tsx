"use client";

/* ============================================================================
   ScrollLogo — the liquid-metal mark sits large and centred at the top of the
   page, then spins and shrinks into the centre of the top bar as you scroll
   the first viewport. Fully scroll-driven, so it plays forward and reverses
   with scroll. The mark itself is the WebGL LiquidLogo (liquid-metal shader).
   ========================================================================== */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import LiquidLogo from "./LiquidLogo";

const BASE = 300; // intrinsic LiquidLogo size; we scale it down to ~26px when docked

export default function ScrollLogo() {
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(800);

  useEffect(() => {
    const f = () => setVh(window.innerHeight);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const end = Math.max(vh * 0.82, 1);
  const rotate = useTransform(scrollY, [0, end], [0, 360]);
  const scale = useTransform(scrollY, [0, end], [1, 26 / BASE]);
  const y = useTransform(scrollY, [0, end], [0, 43 - vh / 2]);
  const glow = useTransform(scrollY, [0, end * 0.6, end], [0.5, 0.18, 0]);

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <motion.div style={{ y, scale, rotate, filter: useTransform(glow, (g) => `drop-shadow(0 0 ${g * 60}px rgba(126,122,240,${g}))`) }}>
        <Link href="/" aria-label="LLMHarness home" style={{ display: "inline-flex", pointerEvents: "auto" }}>
          <LiquidLogo size={BASE} />
        </Link>
      </motion.div>
    </div>
  );
}
