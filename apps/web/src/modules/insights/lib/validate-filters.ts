import type { InsightsListInput } from "../types";

type ValidSeverity = InsightsListInput["severity"];
type ValidType = InsightsListInput["type"];

const VALID_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] satisfies readonly NonNullable<ValidSeverity>[];

const VALID_TYPES = [
  "anomaly",
  "opportunity",
  "trend",
  "saving",
  "warning",
] satisfies readonly NonNullable<ValidType>[];

export function validateSeverity(raw?: string): ValidSeverity | undefined {
  if (!raw || raw === "all") return undefined;

  return VALID_SEVERITIES.includes(raw as any)
    ? (raw as ValidSeverity)
    : undefined;
}

export function validateType(raw?: string): ValidType | undefined {
  if (!raw || raw === "all") return undefined;

  return VALID_TYPES.includes(raw as any) ? (raw as ValidType) : undefined;
}
