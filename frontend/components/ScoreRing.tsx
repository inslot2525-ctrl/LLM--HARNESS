"use client";

import { useEffect, useRef, useState } from "react";
import { getSeverityFromScore, severityConfig } from "@/lib/utils";
import type { Severity } from "@/lib/api";

interface ScoreRingProps {
  score: number;
  severity?: Severity;
  size?: number;
  animated?: boolean;
}

export default function ScoreRing({
  score,
  severity,
  size = 112,
  animated = true,
}: ScoreRingProps) {
  const sev = severity ?? getSeverityFromScore(score);
  const { color } = severityConfig[sev];

  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const [disp, setDisp] = useState(animated ? 0 : score);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!animated) { setDisp(score); return; }
    const dur = 1000;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / dur, 1);
      setDisp((1 - Math.pow(1 - t, 3)) * score);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [score, animated]);

  const offset = circ - disp * circ;

  return (
    <div
      style={{ width: size, height: size, position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      role="img"
      aria-label={`Score ${(score * 100).toFixed(0)}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        {/* Arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 30ms linear" }}
        />
      </svg>

      {/* Center */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, position: "relative" }}>
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-acronym)",
            fontWeight: 300,
            fontSize: size * 0.24,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color,
          }}
        >
          {(disp * 100).toFixed(0)}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: size * 0.08,
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          {sev}
        </span>
      </div>
    </div>
  );
}
