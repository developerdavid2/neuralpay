import type { Period } from "../types";
import { type DateRange } from "react-day-picker";

export function getPeriodDays(period: Period, dateRange?: DateRange): number {
  if (dateRange?.from && dateRange?.to) {
    return Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) /
        (1000 * 60 * 60 * 24),
    );
  }
  switch (period) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return 30;
  }
}
