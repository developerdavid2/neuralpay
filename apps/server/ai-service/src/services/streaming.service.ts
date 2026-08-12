import { db } from "@neuralpay/db";
import {
  bankAccounts,
  budgetAccounts,
  budgetCategories,
  budgets,
  chatMessages,
  connectedPlaidBanks,
  splits,
  transactions,
  vaults,
} from "@neuralpay/db/schema";
import type {
  ContextSnapshot,
  StreamChatRequest,
  StreamChatResponse,
} from "@neuralpay/types";
import { streamText } from "ai";
import { startOfDay } from "date-fns";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import type { Response } from "express";
import { getModel } from "../lib/ai-provider";
import { buildSystemPrompt } from "../lib/prompt";
import { buildTools } from "../lib/tools";
import { AICoachService } from "./coach.service";

const MAX_HISTORY_MESSAGES = 15;

async function fetchGeneralContext(userId: string): Promise<unknown> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const currentMonthSpending = await db
    .select({
      category: transactions.category,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
        Number,
      ),
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "debit"),
        gte(transactions.date, startOfMonth),
      ),
    )
    .groupBy(transactions.category)
    .orderBy(desc(sql`SUM(${transactions.amount})`));

  const [lastMonthTotal] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
        Number,
      ),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "debit"),
        gte(transactions.date, startOfLastMonth),
        lte(transactions.date, endOfLastMonth),
      ),
    );

  // All non-archived budgets — kept small, but no longer arbitrarily
  // truncated to "5 most recently created", which was silently dropping
  // budgets that are genuinely live today.
  const allBudgets = await db
    .select({
      id: budgets.id,
      name: budgets.name,
      limitAmount: budgets.limitAmount,
      startDate: budgets.startDate,
      endDate: budgets.endDate,
      period: budgets.period,
    })
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.isActive, true)))
    .orderBy(desc(budgets.startDate))
    .limit(20);

  // Precompute "is this active TODAY" in code rather than asking the model
  // to do date-range arithmetic from raw ISO strings — this is the actual
  // fix for "AI says no budget matches today's date" when one clearly does.
  const budgetsActiveToday = allBudgets.filter(
    (b) =>
      startOfDay(b.startDate) <= startOfDay(now) &&
      startOfDay(b.endDate) >= startOfDay(now),
  );

  const accounts = await db
    .select({
      name: bankAccounts.name,
      balance: bankAccounts.balance,
      type: bankAccounts.type,
      isManual: bankAccounts.isManual,
    })
    .from(bankAccounts)
    .where(
      and(eq(bankAccounts.userId, userId), eq(bankAccounts.status, "active")),
    )
    .limit(10);

  const connectedBanks = await db
    .select({ institutionName: connectedPlaidBanks.institutionName })
    .from(connectedPlaidBanks)
    .where(eq(connectedPlaidBanks.userId, userId));

  const recentTransactions = await db
    .select({
      description: transactions.description,
      merchant: transactions.merchant,
      amount: transactions.amount,
      category: transactions.category,
      type: transactions.type,
      date: transactions.date,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))
    .limit(10);

  const userVaults = await db
    .select()
    .from(vaults)
    .where(eq(vaults.userId, userId))
    .limit(5);

  return {
    today: now.toISOString().split("T")[0],
    currentMonthSpending: {
      total: currentMonthSpending.reduce((sum, c) => sum + c.total, 0),
      byCategory: currentMonthSpending.slice(0, 5),
    },
    lastMonthTotal: lastMonthTotal?.total ?? 0,
    // Explicitly pre-filtered — the model should treat this as the
    // authoritative answer to "what's active today", not recompute it.
    budgetsActiveToday,
    allBudgets,
    accounts,
    connectedBanks,
    recentTransactions,
    vaults: userVaults,
  };
}

async function fetchAccountContext(
  userId: string,
  accountId: string,
): Promise<unknown> {
  const [account] = await db
    .select()
    .from(bankAccounts)
    .where(and(eq(bankAccounts.id, accountId), eq(bankAccounts.userId, userId)))
    .limit(1);

  if (!account) return { error: "Account not found" };

  const recentTransactions = await db
    .select({
      id: transactions.id,
      description: transactions.description,
      merchant: transactions.merchant,
      amount: transactions.amount,
      category: transactions.category,
      type: transactions.type,
      date: transactions.date,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.bankAccountId, accountId),
        eq(transactions.userId, userId),
      ),
    )
    .orderBy(desc(transactions.date))
    .limit(10);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [monthSpend] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
        Number,
      ),
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.bankAccountId, accountId),
        eq(transactions.userId, userId),
        eq(transactions.type, "debit"),
        gte(transactions.date, monthStart),
      ),
    );

  // Budgets this account is being tracked under — same relationship
  // BudgetsService.loadAccounts reads, just inverted (account → budgets).
  const linkedBudgets = await db
    .select({
      id: budgets.id,
      name: budgets.name,
      limitAmount: budgets.limitAmount,
      isActive: budgets.isActive,
    })
    .from(budgetAccounts)
    .innerJoin(budgets, eq(budgets.id, budgetAccounts.budgetId))
    .where(eq(budgetAccounts.bankAccountId, accountId));

  let connectedBank: { institutionName: string | null } | null = null;
  if (!account.isManual && account.plaidItemId) {
    const [bank] = await db
      .select({ institutionName: connectedPlaidBanks.institutionName })
      .from(connectedPlaidBanks)
      .where(
        and(
          eq(connectedPlaidBanks.userId, userId),
          eq(connectedPlaidBanks.itemId, account.plaidItemId),
        ),
      )
      .limit(1);
    connectedBank = bank ?? null;
  }

  return {
    account,
    recentTransactions,
    currentMonthSpending: monthSpend?.total ?? 0,
    currentMonthTransactionCount: monthSpend?.count ?? 0,
    linkedBudgets,
    connectedBank,
  };
}

async function fetchInstitutionContext(
  userId: string,
  institutionId: string,
): Promise<unknown> {
  const [bank] = await db
    .select()
    .from(connectedPlaidBanks)
    .where(
      and(
        eq(connectedPlaidBanks.id, institutionId),
        eq(connectedPlaidBanks.userId, userId),
      ),
    )
    .limit(1);

  if (!bank) return { error: "Connected bank not found" };

  const linkedAccounts = bank.itemId
    ? await db
        .select({
          id: bankAccounts.id,
          name: bankAccounts.name,
          type: bankAccounts.type,
          balance: bankAccounts.balance,
          status: bankAccounts.status,
          lastSyncedAt: bankAccounts.lastSyncedAt,
        })
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, userId),
            eq(bankAccounts.plaidItemId, bank.itemId),
          ),
        )
    : [];

  return {
    institution: { id: bank.id, name: bank.institutionName },
    linkedAccounts,
    accountCount: linkedAccounts.length,
  };
}

async function fetchTransactionContext(
  userId: string,
  transactionId: string,
): Promise<unknown> {
  const [transaction] = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      category: transactions.category,
      merchant: transactions.merchant,
      notes: transactions.notes,
      bankAccountId: transactions.bankAccountId,
    })
    .from(transactions)
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId)),
    )
    .limit(1);

  if (!transaction) return { error: "Transaction not found" };

  const similarTransactions = await db
    .select({
      amount: transactions.amount,
      date: transactions.date,
      description: transactions.description,
      category: transactions.category,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.category, transaction.category!),
        sql`${transactions.id} != ${transactionId}`,
      ),
    )
    .orderBy(desc(transactions.date))
    .limit(5);

  // Excludes this transaction now, matching similarTransactions — previously
  // this transaction's own amount was silently pulled into its own average.
  const [categoryAvg] = await db
    .select({
      avg: sql<number>`AVG(ABS(${transactions.amount}))`.mapWith(Number),
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.category, transaction.category!),
        sql`${transactions.id} != ${transactionId}`,
      ),
    );

  // Any active budget whose category allocations and date range cover this
  // transaction — so the AI can say "this pushed you over your Dining budget"
  // rather than only knowing the transaction in isolation.
  const relevantBudgets = transaction.category
    ? await db
        .select({
          id: budgets.id,
          name: budgets.name,
          categoryLimit: budgetCategories.limitAmount,
        })
        .from(budgets)
        .innerJoin(budgetCategories, eq(budgetCategories.budgetId, budgets.id))
        .where(
          and(
            eq(budgets.userId, userId),
            eq(budgets.isActive, true),
            eq(budgetCategories.category, transaction.category),
            lte(budgets.startDate, transaction.date),
            gte(budgets.endDate, transaction.date),
          ),
        )
    : [];

  return {
    transaction,
    similarTransactions,
    categoryAverage: categoryAvg?.avg ?? 0,
    categoryCount: categoryAvg?.count ?? 0,
    relevantBudgets,
  };
}

async function fetchBudgetContext(
  userId: string,
  budgetId: string,
): Promise<unknown> {
  const [budget] = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
    .limit(1);

  if (!budget) return { error: "Budget not found" };

  const categoryRows = await db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.budgetId, budgetId));

  const linkedAccounts = await db
    .select({
      bankAccountId: budgetAccounts.bankAccountId,
      name: bankAccounts.name,
    })
    .from(budgetAccounts)
    .innerJoin(bankAccounts, eq(bankAccounts.id, budgetAccounts.bankAccountId))
    .where(eq(budgetAccounts.budgetId, budgetId));

  const accountIds = linkedAccounts.map((a) => a.bankAccountId);

  // Per-category spend, scoped to THIS budget's own date range and its
  // linked accounts (or all accounts, if none are linked) — the same
  // relationship BudgetsService.loadCategories uses. The previous version
  // compared transaction.category against budget.limitAmount, a dollar
  // string, so it never matched anything and spend silently read as 0.
  const categories = await Promise.all(
    categoryRows.map(async (row) => {
      const conditions = [
        eq(transactions.userId, userId),
        eq(transactions.type, "debit"),
        eq(transactions.category, row.category),
        gte(transactions.date, budget.startDate),
        lte(transactions.date, budget.endDate),
      ];
      if (accountIds.length > 0) {
        conditions.push(inArray(transactions.bankAccountId, accountIds));
      }

      const [result] = await db
        .select({
          total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
            Number,
          ),
          count: sql<number>`COUNT(*)`.mapWith(Number),
        })
        .from(transactions)
        .where(and(...conditions));

      const limit = Number(row.limitAmount);
      const spent = result?.total ?? 0;
      return {
        category: row.category,
        limitAmount: limit,
        spent,
        remaining: limit - spent,
        percentUsed: limit > 0 ? Math.round((spent / limit) * 100) : 0,
        transactionCount: result?.count ?? 0,
      };
    }),
  );

  const totalLimit = Number(budget.limitAmount);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);

  return {
    budget,
    categories,
    linkedAccounts: linkedAccounts.map((a) => a.name),
    totalSpent,
    remaining: totalLimit - totalSpent,
    percentUsed:
      totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0,
  };
}

async function fetchVaultContext(
  userId: string,
  vaultId: string,
): Promise<unknown> {
  const [vault] = await db
    .select()
    .from(vaults)
    .where(and(eq(vaults.id, vaultId), eq(vaults.userId, userId)))
    .limit(1);

  if (!vault) return { error: "Vault not found" };

  const target = Number(vault.targetAmount);
  const current = Number(vault.currentAmount);

  return {
    vault,
    progress: target > 0 ? Math.round((current / target) * 100) : 0,
    remaining: target - current,
  };
}

async function fetchSplitContext(
  userId: string,
  splitId: string,
): Promise<unknown> {
  // splits uses creatorId, not userId
  const [split] = await db
    .select()
    .from(splits)
    .where(and(eq(splits.id, splitId), eq(splits.creatorId, userId)))
    .limit(1);

  if (!split) return { error: "Split not found" };

  return { split };
}

export async function fetchContext(
  userId: string,
  contextType: string,
  contextId: string | null,
): Promise<{ data: unknown; snapshot: ContextSnapshot }> {
  let data: unknown;

  switch (contextType) {
    case "general":
      data = await fetchGeneralContext(userId);
      break;
    case "transaction":
      data = contextId
        ? await fetchTransactionContext(userId, contextId)
        : { error: "No transaction ID provided" };
      break;
    case "budget":
      data = contextId
        ? await fetchBudgetContext(userId, contextId)
        : { error: "No budget ID provided" };
      break;
    case "account":
      data = contextId
        ? await fetchAccountContext(userId, contextId)
        : { error: "No account ID provided" };
      break;
    case "institution":
      data = contextId
        ? await fetchInstitutionContext(userId, contextId)
        : { error: "No institution ID provided" };
      break;
    case "vault":
      data = contextId
        ? await fetchVaultContext(userId, contextId)
        : { error: "No vault ID provided" };
      break;
    case "split":
      data = contextId
        ? await fetchSplitContext(userId, contextId)
        : { error: "No split ID provided" };
      break;
    case "insight":
      data = { note: "Insight context fetcher not yet implemented" };
      break;
    default:
      data = await fetchGeneralContext(userId);
  }

  const snapshot: ContextSnapshot = {
    type: contextType,
    data,
    fetchedAt: new Date().toISOString(),
  };

  return { data, snapshot };
}

// ── Message History Fetcher ──
export async function fetchMessageHistory(
  sessionId: string,
  userId: string,
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  const history = await db
    .select({
      role: chatMessages.role,
      content: chatMessages.content,
    })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.sessionId, sessionId),
        eq(chatMessages.userId, userId),
      ),
    )
    .orderBy(chatMessages.createdAt)
    .limit(MAX_HISTORY_MESSAGES);

  return history.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));
}

// ── Main Streaming Handler ──
export async function handleStreamChat(
  req: StreamChatRequest,
  res: Response,
): Promise<StreamChatResponse> {
  const { sessionId, userId, content, planTier = "free" } = req;

  try {
    // 1. Verify session and quota
    const sessionResult = await AICoachService.getOrCreateSession(userId, {
      sessionId,
    });
    if (!sessionResult.success) {
      return {
        success: false,
        error: (
          sessionResult as { success: false; error: string; code?: string }
        ).error,
        code: (
          sessionResult as { success: false; error: string; code?: string }
        ).code,
      };
    }

    const resolvedSessionId = sessionResult.data.id;

    const quotaResult = await AICoachService.checkQuota(userId, planTier);
    if (!quotaResult.success) {
      return {
        success: false,
        error: (quotaResult as { success: false; error: string }).error,
        code: "RATE_LIMITED" as const,
      };
    }

    // 2. Save user message FIRST
    const userMessageResult = await AICoachService.saveMessage(
      resolvedSessionId,
      userId,
      "user",
      content,
    );
    if (!userMessageResult.success) {
      return {
        success: false,
        error: (userMessageResult as { success: false; error: string }).error,
        code: "INTERNAL_SERVER_ERROR" as const,
      };
    }

    // 3. Fetch context
    const { data: contextData, snapshot } = await fetchContext(
      userId,
      sessionResult.data.contextType ?? "",
      sessionResult.data.contextId,
    );

    // 4. Fetch conversation history
    const history = await fetchMessageHistory(resolvedSessionId, userId);

    // 5. Build system prompt
    const systemPrompt = buildSystemPrompt(
      contextData,
      sessionResult.data.contextType ?? "",
    );

    // 6. Stream
    const result = streamText({
      model: getModel(),
      system: systemPrompt,
      messages: [...history, { role: "user" as const, content }],
      tools: buildTools(userId),
      stopWhen: ({ steps }) => steps.length >= 5,
      onFinish: async ({ text, usage, steps }) => {
        const toolResults = steps
          .flatMap((step) => step.toolResults ?? [])
          .map((tr) => ({
            toolName: tr.toolName,
            result: tr.output,
          }));

        const metadata = JSON.stringify({
          contextSnapshot: snapshot,
          model: getModel(),
          toolResults,
        });

        await AICoachService.saveMessage(
          resolvedSessionId,
          userId,
          "assistant",
          text,
          usage.totalTokens,
          metadata,
        );
      },
    });

    result.pipeUIMessageStreamToResponse(res, {
      headers: { "Content-Encoding": "none" },
    });

    return { success: true };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[handleStreamChat]", err);
    return {
      success: false,
      error: err.message,
      code: "INTERNAL_SERVER_ERROR",
    };
  }
}
