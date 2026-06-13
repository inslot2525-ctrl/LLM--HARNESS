"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Copy, Check, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import ResultsView from "@/components/ResultsView";
import SeverityBadge from "@/components/SeverityBadge";
import {
  analyzePrompt,
  generateAttacks,
  scoreAttacks,
} from "@/lib/api";
import type { AnalyzeResponse, AttackResponse, ScoringResponse } from "@/lib/api";

type Phase = "analyze" | "attacks" | "score";
const PHASES: { key: Phase; num: string; label: string }[] = [
  { key: "analyze", num: "01", label: "Analyze" },
  { key: "attacks", num: "02", label: "Attack"  },
  { key: "score",   num: "03", label: "Score"   },
];

/* ── Sidebar phase pip ───────────────────────────────────── */
function PhasePip({ status }: { status: "done" | "active" | "idle" }) {
  return (
    <div
      className={`phase-pip ${
        status === "active" ? "phase-pip-active" :
        status === "done"   ? "phase-pip-done"   :
        "phase-pip-idle"
      }`}
    />
  );
}

/* ── Copy button ─────────────────────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-smoke)", display: "flex" }}
      onClick={async (e) => { e.stopPropagation(); await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
      aria-label="Copy"
    >
      {copied
        ? <Check size={12} color="var(--color-lichen)" />
        : <Copy size={12} />
      }
    </button>
  );
}

/* ── Attack variant row ──────────────────────────────────── */
function VariantRow({
  text, index, selected, onToggle,
}: { text: string; index: number; selected: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.3 }}
      onClick={onToggle}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") onToggle(); }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "18px 20px",
        borderRadius: 16,
        border: selected
          ? "1px solid rgba(128,82,255,0.4)"
          : "1px solid rgba(255,255,255,0.07)",
        cursor: "pointer",
        transition: "border-color 150ms ease",
        userSelect: "none",
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          flexShrink: 0,
          width: 16,
          height: 16,
          borderRadius: 5,
          border: selected ? "none" : "1px solid rgba(255,255,255,0.2)",
          background: selected ? "var(--color-plum-voltage)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
          transition: "all 150ms ease",
        }}
      >
        {selected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Index */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.08em",
          flexShrink: 0,
          marginTop: 1,
          minWidth: 22,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Text */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          lineHeight: 1.6,
          letterSpacing: "0.02em",
          color: "var(--color-ash)",
          flex: 1,
          wordBreak: "break-word",
        }}
      >
        {text}
      </span>

      <CopyBtn text={text} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function HarnessPage() {
  const [phase, setPhase]           = useState<Phase>("analyze");
  const [prompt, setPrompt]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [analyzeRes, setAnalyzeRes] = useState<AnalyzeResponse | null>(null);
  const [attackRes, setAttackRes]   = useState<AttackResponse | null>(null);
  const [scoreRes, setScoreRes]     = useState<ScoringResponse | null>(null);
  const [selected, setSelected]     = useState<Set<number>>(new Set());

  const phaseStatus = (key: Phase): "done" | "active" | "idle" => {
    const o = { analyze: 0, attacks: 1, score: 2 };
    const d = o[key] - o[phase];
    return d < 0 ? "done" : d === 0 ? "active" : "idle";
  };

  const reset = () => {
    setPhase("analyze"); setPrompt(""); setLoading(false); setError(null);
    setAnalyzeRes(null); setAttackRes(null); setScoreRes(null);
    setSelected(new Set());
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(null);
    try {
      setAnalyzeRes(await analyzePrompt(prompt.trim()));
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  };

  const handleGenerateAttacks = async () => {
    setLoading(true); setError(null);
    try {
      const res = await generateAttacks(prompt.trim());
      setAttackRes(res);
      setSelected(new Set(res.variants.map((_, i) => i)));
      setPhase("attacks");
    } catch (e) { setError(e instanceof Error ? e.message : "Attack generation failed"); }
    finally { setLoading(false); }
  };

  const handleScore = async () => {
    if (!attackRes) return;
    const attacks = attackRes.variants.filter((_, i) => selected.has(i));
    if (!attacks.length) { setError("Select at least one attack variant."); return; }
    setLoading(true); setError(null);
    try {
      setScoreRes(await scoreAttacks(prompt.trim(), attacks));
      setPhase("score");
    } catch (e) { setError(e instanceof Error ? e.message : "Scoring failed"); }
    finally { setLoading(false); }
  };

  const toggleVariant = (i: number) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  return (
    <div style={{ background: "var(--color-void)", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ display: "flex", paddingTop: 60, minHeight: "100vh" }}>

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: "1px solid rgba(255,255,255,0.07)",
            padding: "40px 24px",
            position: "sticky",
            top: 60,
            height: "calc(100vh - 60px)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
          className="hidden-mobile"
        >
          {/* Phase stepper */}
          <div style={{ flex: 1 }}>
            <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 24 }}>
              Pipeline
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {PHASES.map(({ key, num, label }, i) => (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <PhasePip status={phaseStatus(key)} />
                    <span
                      style={{
                        fontFamily: "var(--font-acronym)",
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color:
                          phaseStatus(key) === "active" ? "var(--color-bone)" :
                          phaseStatus(key) === "done"   ? "rgba(255,255,255,0.35)" :
                          "rgba(255,255,255,0.15)",
                      }}
                    >
                      {num} {label}
                    </span>
                  </div>
                  {i < PHASES.length - 1 && (
                    <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.06)", marginLeft: 3 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Prompt chip */}
            {prompt && (
              <div
                style={{
                  marginTop: 30,
                  padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                }}
              >
                <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 6 }}>
                  Prompt
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--color-smoke)",
                    lineHeight: 1.6,
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {prompt}
                </p>
              </div>
            )}
          </div>

          {phase !== "analyze" && (
            <button
              onClick={reset}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--color-smoke)",
                fontFamily: "var(--font-acronym)",
                fontSize: 12,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: 0,
                marginTop: 24,
                transition: "color 120ms",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-ash)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-smoke)")}
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </aside>

        {/* ── Main ────────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "48px 48px 96px",
            maxWidth: 860,
          }}
        >

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginBottom: 30,
                  padding: "14px 18px",
                  border: "1px solid rgba(255,184,41,0.3)",
                  borderRadius: 16,
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--color-amber-spark)",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ════════ PHASE 1: ANALYZE ════════ */}
            {phase === "analyze" && (
              <motion.div
                key="analyze"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 36 }}
              >
                {/* Heading */}
                <div>
                  <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 16 }}>
                    Phase 01
                  </p>
                  <h1
                    style={{
                      fontFamily: "var(--font-acronym)",
                      fontWeight: 300,
                      fontSize: "clamp(36px, 4vw, 52px)",
                      lineHeight: 1.0,
                      letterSpacing: "-0.04em",
                      color: "var(--color-bone)",
                      margin: "0 0 16px",
                    }}
                  >
                    Analyze the prompt.
                  </h1>
                  <p className="type-base" style={{ color: "var(--color-smoke)", margin: 0, maxWidth: 480 }}>
                    Enter any prompt to classify its intent and risk level
                    before generating adversarial attacks.
                  </p>
                </div>

                {/* Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <textarea
                    className="dala-textarea"
                    rows={7}
                    placeholder="Enter a prompt to analyze…"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleAnalyze();
                    }}
                    aria-label="Prompt to analyze"
                  />
                  <p
                    style={{
                      fontFamily: "var(--font-acronym)",
                      fontSize: 12,
                      color: "var(--color-smoke)",
                      letterSpacing: "0.021em",
                    }}
                  >
                    <kbd style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>⌘ Enter</kbd>
                    {" "}to analyze
                  </p>
                </div>

                <button
                  className="btn-plum"
                  onClick={handleAnalyze}
                  disabled={!prompt.trim() || loading}
                  style={{ alignSelf: "flex-start" }}
                >
                  {loading ? <><span className="spinner" />Analyzing…</> : "Analyze Prompt"}
                </button>

                {/* Result */}
                <AnimatePresence>
                  {analyzeRes && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: "flex", flexDirection: "column", gap: 30 }}
                    >
                      <div className="divider" />

                      <p className="type-eyebrow" style={{ color: "var(--color-smoke)" }}>
                        Analysis Result
                      </p>

                      {/* Big risk number */}
                      <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "flex-start" }}>
                        <div>
                          <div
                            className="score-display tabular"
                            style={{
                              fontSize: 78,
                              color:
                                analyzeRes.risk >= 0.65
                                  ? "var(--color-amber-spark)"
                                  : analyzeRes.risk >= 0.40
                                  ? "var(--color-plum-voltage)"
                                  : "var(--color-lichen)",
                              lineHeight: 0.9,
                              marginBottom: 10,
                            }}
                          >
                            {(analyzeRes.risk * 100).toFixed(0)}
                          </div>
                          <p className="type-eyebrow" style={{ color: "var(--color-smoke)" }}>
                            Risk Score
                          </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 8 }}>
                          <div>
                            <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 8 }}>
                              Category
                            </p>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 13,
                                color: "var(--color-plum-voltage)",
                                border: "1px solid rgba(128,82,255,0.3)",
                                borderRadius: 24,
                                padding: "4px 14px",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {analyzeRes.category}
                            </span>
                          </div>
                          <div>
                            <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 8 }}>
                              Intent
                            </p>
                            <p
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 13,
                                color: "var(--color-ash)",
                                margin: 0,
                              }}
                            >
                              {analyzeRes.intent}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn-plum"
                        onClick={handleGenerateAttacks}
                        disabled={loading}
                        style={{ alignSelf: "flex-start" }}
                      >
                        {loading
                          ? <><span className="spinner" />Generating…</>
                          : <>Generate Attacks <ChevronRight size={13} /></>
                        }
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ════════ PHASE 2: ATTACKS ════════ */}
            {phase === "attacks" && attackRes && (
              <motion.div
                key="attacks"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 36 }}
              >
                <div>
                  <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 16 }}>
                    Phase 02
                  </p>
                  <h1
                    style={{
                      fontFamily: "var(--font-acronym)",
                      fontWeight: 300,
                      fontSize: "clamp(36px, 4vw, 52px)",
                      lineHeight: 1.0,
                      letterSpacing: "-0.04em",
                      color: "var(--color-bone)",
                      margin: "0 0 16px",
                    }}
                  >
                    Select attacks to score.
                  </h1>
                  <p className="type-base" style={{ color: "var(--color-smoke)", margin: 0 }}>
                    {attackRes.variants.length} variants generated for category{" "}
                    <span style={{ color: "var(--color-plum-voltage)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {attackRes.category}
                    </span>
                    .
                  </p>
                </div>

                {/* Select all/none */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="type-eyebrow" style={{ color: "var(--color-smoke)" }}>
                    {selected.size} / {attackRes.variants.length} selected
                  </p>
                  <div style={{ display: "flex", gap: 20 }}>
                    {[
                      ["All",  () => setSelected(new Set(attackRes.variants.map((_, i) => i)))],
                      ["None", () => setSelected(new Set())],
                    ].map(([label, fn]) => (
                      <button
                        key={label as string}
                        onClick={fn as () => void}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-acronym)",
                          fontSize: 12,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: "var(--color-smoke)",
                          padding: 0,
                          transition: "color 120ms",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--color-bone)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-smoke)")}
                      >
                        {label as string}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {attackRes.variants.map((v, i) => (
                    <VariantRow
                      key={i}
                      text={v}
                      index={i}
                      selected={selected.has(i)}
                      onToggle={() => toggleVariant(i)}
                    />
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 8 }}>
                  <button
                    className="btn-plum"
                    onClick={handleScore}
                    disabled={loading || selected.size === 0}
                  >
                    {loading
                      ? <><span className="spinner" />Scoring…</>
                      : <>Score {selected.size} Attack{selected.size !== 1 ? "s" : ""} <ChevronRight size={13} /></>
                    }
                  </button>
                  <button className="btn-ghost" onClick={() => setPhase("analyze")}>
                    Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════════ PHASE 3: SCORE ════════ */}
            {phase === "score" && scoreRes && (
              <motion.div
                key="score"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 36 }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <p className="type-eyebrow" style={{ color: "var(--color-smoke)", marginBottom: 16 }}>
                      Phase 03
                    </p>
                    <h1
                      style={{
                        fontFamily: "var(--font-acronym)",
                        fontWeight: 300,
                        fontSize: "clamp(36px, 4vw, 52px)",
                        lineHeight: 1.0,
                        letterSpacing: "-0.04em",
                        color: "var(--color-bone)",
                        margin: 0,
                      }}
                    >
                      Scoring complete.
                    </h1>
                  </div>
                  <button className="btn-ghost" onClick={reset} style={{ flexShrink: 0 }}>
                    <RotateCcw size={12} />
                    New Test
                  </button>
                </div>

                <div className="divider" />
                <ResultsView data={scoreRes} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Mobile sidebar suppression */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
