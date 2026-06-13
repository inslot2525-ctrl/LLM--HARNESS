const API_BASE =
  typeof window !== "undefined"
    ? "/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AnalyzeResponse {
  risk: number;
  category: string;
  intent: string;
}

export interface AttackResponse {
  original_prompt: string;
  category: string;
  intent: string;
  variants: string[];
}

export interface EnrichmentSignals {
  refusal_detected: boolean;
  sensitivity_keywords_found: string[];
  response_length_signal: number;
  keyword_density_score: number;
}

export interface DeepEvalResult {
  hallucination_score: number;
  toxicity_score: number;
  bias_score: number;
  risk_score: number;
  metrics_available: boolean;
}

export interface EmbeddingResult {
  similarity: number;
  drifted: boolean;
  drift_magnitude: number;
  embedding_available: boolean;
}

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";

export interface AttackResult {
  attack: string;
  model_response: string;
  judge_score: number;
  violated: boolean;
  category: string;
  reasoning: string;
  confidence: number;
  enrichment: EnrichmentSignals;
  deepeval_result: DeepEvalResult;
  embedding_result: EmbeddingResult;
  composite_score: number;
  severity: Severity;
}

export interface AttackSummary {
  attack: string;
  composite_score: number;
  severity: Severity;
  violated: boolean;
}

export interface ScoringResponse {
  original_prompt: string;
  total_attacks_evaluated: number;
  winning_attack: AttackResult;
  all_results: AttackResult[];
  summary: AttackSummary[];
  composite_risk: number;
  violation_rate: number;
  severity_distribution: Record<string, number>;
  evaluation_time_ms: number;
  timestamp: string;
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const analyzePrompt = (prompt: string) =>
  request<AnalyzeResponse>("/analyze", { prompt });

export const generateAttacks = (prompt: string) =>
  request<AttackResponse>("/attacks", { prompt });

export const scoreAttacks = (original_prompt: string, attacks: string[]) =>
  request<ScoringResponse>("/score", { original_prompt, attacks });
