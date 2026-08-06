import type { CreateBudgetInput } from "@neuralpay/types";

// Form values are the create payload minus derived/defaulted server fields.
export type BudgetFormValues = {
  name: string;
  description?: string;
  category: CreateBudgetInput["category"];
  limitAmount: number;
  color?: string;
  period: "weekly" | "monthly" | "custom";
  startDate: string; // ISO
  endDate: string; // ISO
  alertThreshold: number;
  accountIds: string[];
};
