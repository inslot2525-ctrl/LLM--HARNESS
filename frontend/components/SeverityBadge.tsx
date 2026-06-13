import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/api";

const MAP: Record<Severity, string> = {
  CRITICAL: "sev-critical",
  HIGH:     "sev-high",
  MEDIUM:   "sev-medium",
  LOW:      "sev-low",
  SAFE:     "sev-safe",
};

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export default function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span className={cn("sev-badge", MAP[severity], className)}>
      {severity}
    </span>
  );
}
