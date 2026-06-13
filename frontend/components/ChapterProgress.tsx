"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CHAPTERS = [
  { id: "hero",    label: "Intro"      },
  { id: "threat",  label: "The Threat" },
  { id: "analyze", label: "01 Analyze" },
  { id: "attack",  label: "02 Attack"  },
  { id: "score",   label: "03 Score"   },
  { id: "cta",     label: "Start"      },
];

export default function ChapterProgress() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    CHAPTERS.forEach(({ id }, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(i); },
        { threshold: 0.3 }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach(io => io.disconnect());
  }, []);

  return (
    <nav
      aria-label="Story chapters"
      style={{
        position: "fixed",
        right: 20,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {CHAPTERS.map(({ id, label }, i) => (
        <a
          key={id}
          href={`#${id}`}
          title={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "flex-end",
            textDecoration: "none",
          }}
        >
          <motion.span
            animate={{ opacity: active === i ? 1 : 0, x: active === i ? 0 : 6 }}
            transition={{ duration: 0.2 }}
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--brand)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </motion.span>
          <motion.div
            animate={{
              scale: active === i ? 1.6 : 1,
              backgroundColor: active === i ? "#F97316" : "rgba(255,255,255,0.22)",
            }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0 }}
          />
        </a>
      ))}
    </nav>
  );
}
