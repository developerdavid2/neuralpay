import { buildGetAccountsTool } from "./accounts/get-accounts.tool";
import { buildProposeAccountCreateTool } from "./accounts/propose-account-create.tool";

import { buildGetUnbudgetedSpendingTool } from "./budgets/get-unbudgeted-spending.tool";
import { buildProposeBudgetCreateTool } from "./budgets/propose-budget-create.tool";
import { buildProposeBudgetDeleteTool } from "./budgets/propose-budget-delete.tool";
import { buildProposeBudgetEditTool } from "./budgets/propose-budget-edit.tool";
import { buildProposeBudgetRebalanceTool } from "./budgets/propose-budget-rebalance.tool";
import { buildProposeSpendingGoalTool } from "./budgets/propose-spending-goal.tool";
import { buildQueryBudgetsTool } from "./budgets/query-budgets.tool";
import { buildSpendingChartTool } from "./charts/spending-chart.tool";
import { buildProposeInsightDismissTool } from "./insights/propose-insight-dismiss.tool";
import { buildGetSpendingAnalysisTool } from "./transactions/get-spending-analysis.tool";
import { buildProposeRecategorizeTool } from "./transactions/propose-recategorize.tool";
import { buildQueryTransactionsTool } from "./transactions/query-transactions.tool";
import { type Tool } from "ai";
import { toJsonSafe } from "../lib/to-json-safe";

function withJsonSafeExecute<T extends Tool>(tool: T): T {
  const execute = tool.execute;
  if (!execute) return tool;
  tool.execute = (async (
    args: unknown,
    options: Parameters<NonNullable<T["execute"]>>[1],
  ) => toJsonSafe(await execute(args, options))) as NonNullable<
    T["execute"]
  >;
  return tool;
}

export function buildTools(userId: string) {
  const tools = {
    // Accounts — query
    getAccounts: buildGetAccountsTool(userId),
    // Accounts — propose
    proposeAccountCreate: buildProposeAccountCreateTool(userId),

    // Budgets — query
    queryBudgets: buildQueryBudgetsTool(userId),
    getUnbudgetedSpending: buildGetUnbudgetedSpendingTool(userId),
    // Budgets — propose
    proposeBudgetCreate: buildProposeBudgetCreateTool(userId),
    proposeBudgetEdit: buildProposeBudgetEditTool(userId),
    proposeBudgetDelete: buildProposeBudgetDeleteTool(userId),
    proposeBudgetRebalance: buildProposeBudgetRebalanceTool(userId),
    proposeSpendingGoal: buildProposeSpendingGoalTool(userId),

    // Transactions — query
    queryTransactions: buildQueryTransactionsTool(userId),
    getSpendingAnalysis: buildGetSpendingAnalysisTool(userId),
    // Transactions — propose
    proposeRecategorize: buildProposeRecategorizeTool(userId),

    // Insights — propose
    proposeInsightDismiss: buildProposeInsightDismissTool(userId),

    // Charts
    renderSpendingChart: buildSpendingChartTool(userId),
  };

  return Object.fromEntries(
    Object.entries(tools).map(([name, tool]) => [
      name,
      withJsonSafeExecute(tool),
    ]),
  );
}
