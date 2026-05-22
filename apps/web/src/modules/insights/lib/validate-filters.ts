import type { InsightsListInput } from "../types";

type ValidSeverity = NonNullable<InsightsListInput["severity"]>;
type ValidType = NonNullable<InsightsListInput["type"]>;

const VALID_SEVERITIES = ["low", "medium", "high", "critical"] as const;

const VALID_TYPES = [
  "anomaly",
  "opportunity",
  "trend",
  "saving",
  "warning",
] as const;

export function validateSeverity(raw?: string): ValidSeverity | undefined {
  if (!raw || raw === "all") return undefined;
  return VALID_SEVERITIES.includes(raw as ValidSeverity)
    ? (raw as ValidSeverity)
    : undefined;
}

export function validateType(raw?: string): ValidType | undefined {
  if (!raw || raw === "all") return undefined;
  return VALID_TYPES.includes(raw as ValidType)
    ? (raw as ValidType)
    : undefined;
}
