"use client";

import { motion } from "framer-motion";
import type { ScoringResponse } from "@/lib/api";
import { severityConfig, formatPct, formatMs } from "@/lib/utils";
import ScoreRing from "./ScoreRing";
import AttackCard from "./AttackCard";

const SEV_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE"] as const;

export default function ResultsView({ data }: { data: ScoringResponse }) {
  const maxCount = Math.max(...SEV_ORDER.map(s => data.severity_distribution[s] ?? 0), 1);
  const winCfg = severityConfig[data.winning_attack.severity];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

      {/* ── Summary stats ── 3-column grid on void */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "rgba(255,255,255,0.07)",
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        {[
          {
            value: formatPct(data.composite_risk),
            label: "Composite Risk",
            color: winCfg.color,
            delay: 0,
          },
          {
            value: formatPct(data.violation_rate),
            label: "Violation Rate",
            color: data.violation_rate > 0.5 ? "var(--color-amber-spark)"
                 : data.violation_rate > 0.2 ? "var(--color-plum-voltage)"
                 : "var(--color-lichen)",
            delay: 0.06,
          },
          {
            value: formatMs(data.evaluation_time_ms),
            label: "Eval Time",
            color: "var(--color-ash)",
            delay: 0.12,
          },
        ].map(s => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: s.delay, duration: 0.35 }}
            style={{ background: "#000", padding: "28px 30px" }}
          >
            <div
              className="score-display tabular"
              style={{ fontSize: 42, color: s.color, marginBottom: 10, lineHeight: 1 }}
            >
              {s.value}
            </div>
            <p className="type-eyebrow" style={{ color: "var(--color-smoke)", margin: 0 }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Winning attack + severity dist ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,0.07)", borderRadius: 24, overflow: "hidden" }}>

        {/* Winning attack */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          style={{ background: "#000", padding: 30, display: "flex", gap: 24, alignItems: "flex-start" }}
        >
          <div style={{ flexShrink: 0 }}>
            <ScoreRing score={data.winning_attack.composite_score} severity={data.winning_attack.severity} size={96} animated />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="type-eyebrow" style={{ color: "var(--color-smoke)", margin: 0 }}>
              Winning Attack
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.65, color: "var(--color-ash)", margin: 0, wordBreak: "break-word" }}>
              {data.winning_attack.attack}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {[
                ["Category",   data.winning_attack.category],
                ["Judge",      formatPct(data.winning_attack.judge_score)],
                ["Confidence", formatPct(data.winning_attack.confidence)],
              ].map(([k, v]) => (
                <div key={k}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-smoke)", letterSpacing: "0.05em" }}>{k}: </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ash)" }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-smoke)", fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>
              &ldquo;{data.winning_attack.reasoning}&rdquo;
            </p>
          </div>
        </motion.div>

        {/* Severity distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4 }}
          style={{ background: "#000", padding: 30, display: "flex", flexDirection: "column", gap: 20 }}
        >
          <p className="type-eyebrow" style={{ color: "var(--color-smoke)", margin: 0 }}>
            Severity Distribution
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {SEV_ORDER.map(sev => {
              const count = data.severity_distribution[sev] ?? 0;
              const cfg = severityConfig[sev];
              return (
                <div key={sev} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: cfg.color,
                      width: 60,
                      flexShrink: 0,
                    }}
                  >
                    {sev}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)", position: "relative" }}>
                    <motion.div
                      style={{ position: "absolute", top: 0, left: 0, height: 1, background: cfg.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCount) * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.3 + cfg.order * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                  </div>
                  <span
                    className="tabular"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.25)", width: 16, textAlign: "right", flexShrink: 0 }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── All results ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 8 }}>
          All Results
          <span style={{ marginLeft: 8, opacity: 0.3 }}>({data.total_attacks_evaluated})</span>
        </p>
        {data.all_results.map((r, i) => (
          <AttackCard key={i} result={r} index={i} isWinner={i === 0} />
        ))}
      </div>
    </div>
  );
}
