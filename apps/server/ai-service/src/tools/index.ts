import { buildGetAccountBalancesTool } from "./accounts/get-account-balances.tool";
import { buildGetAccountUtilizationTool } from "./accounts/get-account-utilization.tool";
import { buildProposeAccountCreateTool } from "./accounts/propose-account-create.tool";

import { buildGetBudgetByIdTool } from "./budgets/get-budget-by-id.tool";
import { buildGetBudgetHealthSummaryTool } from "./budgets/get-budget-health-summary.tool";
import { buildGetUnbudgetedSpendingTool } from "./budgets/get-unbudgeted-spending.tool";
import { buildListActiveBudgetsTool } from "./budgets/list-active-budgets.tool";
import { buildProposeBudgetCreateTool } from "./budgets/propose-budget-create.tool";
import { buildProposeBudgetDeleteTool } from "./budgets/propose-budget-delete.tool";
import { buildProposeBudgetEditTool } from "./budgets/propose-budget-edit.tool";
import { buildProposeBudgetRebalanceTool } from "./budgets/propose-budget-rebalance.tool";
import { buildProposeSpendingGoalTool } from "./budgets/propose-spending-goal.tool";
import { buildSpendingChartTool } from "./charts/spending-chart.tool";
import { buildProposeInsightDismissTool } from "./insights/propose-insight-dismiss.tool";
import { buildComparePeriodsTool } from "./transactions/compare-periods.tool";
import { buildGetAnomalousTransactionsTool } from "./transactions/get-anomalous-transactions.tool";
import { buildGetCurrentMonthSpendingTool } from "./transactions/get-current-month-spending.tool";
import { buildGetRecentTransactionsTool } from "./transactions/get-recent-transactions.tool";
import { buildGetSpendingOverviewTool } from "./transactions/get-spending-overview.tool";
import { buildGetTopCategoriesTool } from "./transactions/get-top-categories.tool";
import { buildProposeRecategorizeTool } from "./transactions/propose-recategorize.tool";
import { buildSearchTransactionsTool } from "./transactions/search-transactions.tool";

export function buildTools(userId: string) {
  return {
    // Accounts — query
    getAccountBalances: buildGetAccountBalancesTool(userId),
    getAccountUtilization: buildGetAccountUtilizationTool(userId),
    // Accounts — propose
    proposeAccountCreate: buildProposeAccountCreateTool(userId),

    // Budgets — query
    getBudgetById: buildGetBudgetByIdTool(userId),
    listActiveBudgets: buildListActiveBudgetsTool(userId),
    getBudgetHealthSummary: buildGetBudgetHealthSummaryTool(userId),
    getUnbudgetedSpending: buildGetUnbudgetedSpendingTool(userId),
    // Budgets — propose
    proposeBudgetCreate: buildProposeBudgetCreateTool(userId),
    proposeBudgetEdit: buildProposeBudgetEditTool(userId),
    proposeBudgetDelete: buildProposeBudgetDeleteTool(userId),
    proposeBudgetRebalance: buildProposeBudgetRebalanceTool(userId),
    proposeSpendingGoal: buildProposeSpendingGoalTool(userId),

    // Transactions — query
    getRecentTransactions: buildGetRecentTransactionsTool(userId),
    searchTransactions: buildSearchTransactionsTool(userId),
    getSpendingOverview: buildGetSpendingOverviewTool(userId),
    getTopCategories: buildGetTopCategoriesTool(userId),
    getCurrentMonthSpending: buildGetCurrentMonthSpendingTool(userId),
    comparePeriods: buildComparePeriodsTool(userId),
    getAnomalousTransactions: buildGetAnomalousTransactionsTool(userId),
    // Transactions — propose
    proposeRecategorize: buildProposeRecategorizeTool(userId),

    // Insights — propose
    proposeInsightDismiss: buildProposeInsightDismissTool(userId),

    // Charts
    renderSpendingChart: buildSpendingChartTool(userId),
  };
}
