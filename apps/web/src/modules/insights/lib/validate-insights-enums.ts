import {
  INSIGHT_SEVERITIES,
  INSIGHT_TYPES,
  type InsightSeverity,
  type InsightType,
} from "@neuralpay/types";

export function validateInsightSeverity(
  raw?: string,
): InsightSeverity | undefined {
  if (!raw || raw === "all") return undefined;
  return INSIGHT_SEVERITIES.includes(raw as InsightSeverity)
    ? (raw as InsightSeverity)
    : undefined;
}

export function validateInsightType(raw?: string): InsightType | undefined {
  if (!raw || raw === "all") return undefined;
  return INSIGHT_TYPES.includes(raw as InsightType)
    ? (raw as InsightType)
    : undefined;
}
