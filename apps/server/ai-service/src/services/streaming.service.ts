import { db } from "@neuralpay/db";
import {
  bankAccounts,
  budgets,
  chatMessages,
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
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { Response } from "express";
import { getModel } from "../lib/ai-provider";
import { buildSystemPrompt } from "../lib/prompt";
import { AICoachService } from "./coach.service";

const MAX_HISTORY_MESSAGES = 15;

async function fetchGeneralContext(userId: string): Promise<unknown> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Current month spending by category
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
        gte(transactions.date, startOfMonth),
      ),
    )
    .groupBy(transactions.category)
    .orderBy(desc(sql`SUM(${transactions.amount})`));

  // Last month total for comparison
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
        gte(transactions.date, startOfLastMonth),
        lte(transactions.date, endOfLastMonth),
      ),
    );

  // Active budgets — no isActive column on budgets, filter by userId only
  const activeBudgets = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .limit(5);

  // Account balances — status column is "active" | "disconnected"
  const accounts = await db
    .select({
      name: bankAccounts.name,
      balance: bankAccounts.balance,
      type: bankAccounts.type,
    })
    .from(bankAccounts)
    .where(
      and(eq(bankAccounts.userId, userId), eq(bankAccounts.status, "active")),
    )
    .limit(10);

  // Vault progress — no isActive column on vaults
  const userVaults = await db
    .select()
    .from(vaults)
    .where(eq(vaults.userId, userId))
    .limit(5);

  return {
    currentMonthSpending: {
      total: currentMonthSpending.reduce((sum, c) => sum + c.total, 0),
      byCategory: currentMonthSpending.slice(0, 5),
    },
    lastMonthTotal: lastMonthTotal?.total ?? 0,
    activeBudgets,
    accounts,
    vaults: userVaults,
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
    })
    .from(transactions)
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId)),
    )
    .limit(1);

  if (!transaction) return { error: "Transaction not found" };

  // Similar transactions (same category, excluding this one)
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

  // Category average for this user's transactions in same category
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
      ),
    );

  return {
    transaction,
    similarTransactions,
    categoryAverage: categoryAvg?.avg ?? 0,
    categoryCount: categoryAvg?.count ?? 0,
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

  // Spending against this budget's category this month
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  const [spending] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(
        Number,
      ),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.category, budget.category),
        gte(transactions.date, startOfMonth),
      ),
    );

  const totalSpent = spending?.total ?? 0;

  return {
    budget,
    currentMonthSpending: totalSpent,
    remaining: Number(budget.limitAmount) - totalSpent,
    percentUsed:
      Number(budget.limitAmount) > 0
        ? Math.round((totalSpent / Number(budget.limitAmount)) * 100)
        : 0,
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

async function fetchContext(
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
async function fetchMessageHistory(
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
      onFinish: async ({ text, usage }) => {
        const metadata = JSON.stringify({
          contextSnapshot: snapshot,
          model: getModel(),
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
