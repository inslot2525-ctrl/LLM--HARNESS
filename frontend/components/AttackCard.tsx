"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, Check } from "lucide-react";
import type { AttackResult } from "@/lib/api";
import { severityConfig, formatPct } from "@/lib/utils";
import SeverityBadge from "./SeverityBadge";

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false);
  return (
    <button
      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "var(--color-smoke)" }}
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setC(true);
        setTimeout(() => setC(false), 1600);
      }}
      aria-label="Copy"
    >
      {c ? <Check size={12} color="var(--color-lichen)" /> : <Copy size={12} />}
    </button>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-smoke)", letterSpacing: "0.05em" }}>
          {label}
        </span>
        <span className="tabular" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color, letterSpacing: "0.05em" }}>
          {formatPct(value)}
        </span>
      </div>
      <div className="metric-track">
        <motion.div
          className="metric-fill"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
    </div>
  );
}

interface AttackCardProps {
  result: AttackResult;
  index: number;
  isWinner?: boolean;
}

export default function AttackCard({ result, index, isWinner }: AttackCardProps) {
  const [open, setOpen] = useState(isWinner ?? false);
  const cfg = severityConfig[result.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      style={{
        border: isWinner
          ? `1px solid rgba(128,82,255,0.3)`
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        overflow: "hidden",
        transition: "border-color 160ms ease",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          padding: "20px 24px",
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
        }}
        aria-expanded={open}
      >
        {/* Index */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "rgba(255,255,255,0.18)",
            letterSpacing: "0.08em",
            flexShrink: 0,
            paddingTop: 2,
            minWidth: 20,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <SeverityBadge severity={result.severity} />
            {result.violated
              ? <span className="tag-violated">&#9642; Violated</span>
              : <span className="tag-refused">&#10003; Refused</span>
            }
            {isWinner && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-plum-voltage)",
                }}
              >
                &#9650; Winning
              </span>
            )}
          </div>
          {/* Attack text */}
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--color-ash)",
              margin: 0,
              display: open ? "block" : "-webkit-box",
              WebkitLineClamp: open ? undefined : 2,
              WebkitBoxOrient: "vertical",
              overflow: open ? "visible" : "hidden",
              wordBreak: "break-word",
            }}
          >
            {result.attack}
          </p>
        </div>

        {/* Score + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div
              className="score-display tabular"
              style={{ fontSize: 24, color: cfg.color, lineHeight: 1 }}
            >
              {(result.composite_score * 100).toFixed(0)}
            </div>
            <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginTop: 3 }}>
              score
            </p>
          </div>
          <ChevronDown
            size={15}
            style={{
              color: "var(--color-smoke)",
              transition: "transform 180ms ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              flexShrink: 0,
            }}
          />
        </div>
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "24px 24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              {/* Score grid — no panels, just grid lines */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 1,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                {[
                  { label: "Judge",      v: result.judge_score,                              color: cfg.color },
                  { label: "DeepEval",   v: result.deepeval_result.risk_score,                color: "var(--color-plum-voltage)" },
                  { label: "Embedding",  v: Math.max(0, result.embedding_result.similarity),  color: "var(--color-ash)" },
                  { label: "Confidence", v: result.confidence,                                color: "var(--color-smoke)" },
                ].map(m => (
                  <div key={m.label} style={{ background: "#000", padding: "14px 16px" }}>
                    <div
                      className="score-display tabular"
                      style={{ fontSize: 22, color: m.color, marginBottom: 4 }}
                    >
                      {formatPct(m.v)}
                    </div>
                    <p className="type-eyebrow" style={{ color: "var(--color-smoke)", margin: 0 }}>
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* DeepEval metrics */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 6 }}>
                  DeepEval Metrics
                </p>
                <MetricBar label="Toxicity"      value={result.deepeval_result.toxicity_score}      color="var(--color-amber-spark)" />
                <MetricBar label="Hallucination" value={result.deepeval_result.hallucination_score} color="var(--color-plum-voltage)" />
                <MetricBar label="Bias"          value={result.deepeval_result.bias_score}          color="var(--color-ash)" />
              </div>

              {/* Embedding + Enrichment */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 12 }}>Embedding</p>
                  {[
                    ["Similarity",  result.embedding_result.similarity.toFixed(4),       ""],
                    ["Drift mag",   result.embedding_result.drift_magnitude.toFixed(4),   ""],
                    ["Drifted",     result.embedding_result.drifted ? "YES" : "NO",
                      result.embedding_result.drifted ? "var(--color-amber-spark)" : "var(--color-lichen)"],
                  ].map(([k, v, accent]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-smoke)" }}>{k}</span>
                      <span className="tabular" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: accent || "var(--color-ash)" }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 12 }}>Enrichment</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-smoke)" }}>Refusal</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: result.enrichment.refusal_detected ? "var(--color-lichen)" : "var(--color-amber-spark)" }}>
                      {result.enrichment.refusal_detected ? "DETECTED" : "NONE"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-smoke)" }}>Keyword density</span>
                    <span className="tabular" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ash)" }}>
                      {formatPct(result.enrichment.keyword_density_score)}
                    </span>
                  </div>
                  {result.enrichment.sensitivity_keywords_found.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                      {result.enrichment.sensitivity_keywords_found.map(kw => (
                        <span key={kw} className="sev-badge sev-critical" style={{ fontSize: 9 }}>{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 8 }}>Judge Reasoning</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-ash)", lineHeight: 1.65, margin: 0 }}>
                  {result.reasoning}
                </p>
              </div>

              {/* Model response */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p className="type-eyebrow" style={{ color: "var(--color-smoke)", margin: 0 }}>Model Response</p>
                  <CopyBtn text={result.model_response} />
                </div>
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    maxHeight: 140,
                    overflowY: "auto",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-smoke)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {result.model_response}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
