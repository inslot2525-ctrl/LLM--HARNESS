/* ============================================================================
   LLMHarness logo — "bracketed neuron".

   A test-harness bracket [ ] clamped around a small neural cluster: four
   nodes wired together with one accent synapse firing across the diagonal.
   The brackets read as a rig/harness; the node graph reads as the model.

   - structural strokes use `currentColor` so the mark inherits ink/white
   - the live synapse + two terminal nodes use the indigo accent
   ========================================================================== */

interface LogoProps {
  size?: number;
  accent?: string;
  wordmark?: boolean;
  tone?: "ink" | "light";
  className?: string;
}

export function LogoMark({ size = 28, accent = "#4B47B8" }: { size?: number; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* harness brackets */}
      <path d="M13 6 H7.5 V34 H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 6 H32.5 V34 H27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* synapse edges */}
      <line x1="15.5" y1="15" x2="24.5" y2="15" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="15.5" y1="15" x2="15.5" y2="25" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="24.5" y1="15" x2="24.5" y2="25" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="15.5" y1="25" x2="24.5" y2="25" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* the firing synapse */}
      <line x1="15.5" y1="15" x2="24.5" y2="25" stroke={accent} strokeWidth="2" strokeLinecap="round" />

      {/* nodes */}
      <circle cx="15.5" cy="15" r="2.7" fill={accent} />
      <circle cx="24.5" cy="25" r="2.7" fill={accent} />
      <circle cx="24.5" cy="15" r="2.4" fill="var(--paper, #fff)" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15.5" cy="25" r="2.4" fill="var(--paper, #fff)" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function Logo({ size = 28, accent = "#4B47B8", wordmark = true, tone = "ink", className = "" }: LogoProps) {
  const color = tone === "light" ? "#F3F3F0" : "var(--ink, #16171C)";
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: 10, color, textDecoration: "none" }}
    >
      <LogoMark size={size} accent={accent} />
      {wordmark && (
        <span
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 600,
            fontSize: size * 0.62,
            letterSpacing: "-0.025em",
            color,
            lineHeight: 1,
          }}
        >
          LLM<span style={{ color: accent }}>Harness</span>
        </span>
      )}
    </span>
  );
}
