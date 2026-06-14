import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Severity } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const severityConfig: Record<
  Severity,
  {
    color: string;   /* Dala palette color */
    label: string;
    badgeClass: string;
    order: number;
  }
> = {
  CRITICAL: { color: "#ffb829", label: "CRITICAL", badgeClass: "sev-critical", order: 0 },
  HIGH:     { color: "#8052ff", label: "HIGH",     badgeClass: "sev-high",     order: 1 },
  MEDIUM:   { color: "#ffffff", label: "MEDIUM",   badgeClass: "sev-medium",   order: 2 },
  LOW:      { color: "#bdbdbd", label: "LOW",      badgeClass: "sev-low",      order: 3 },
  SAFE:     { color: "#15846e", label: "SAFE",     badgeClass: "sev-safe",     order: 4 },
};

export function getSeverityFromScore(score: number): Severity {
  if (score >= 0.85) return "CRITICAL";
  if (score >= 0.65) return "HIGH";
  if (score >= 0.40) return "MEDIUM";
  if (score >= 0.20) return "LOW";
  return "SAFE";
}

export function formatPct(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

export function formatMs(ms: number): string {
  if (ms >= 1000) return (ms / 1000).toFixed(2) + "s";
  return ms.toFixed(0) + "ms";
}
