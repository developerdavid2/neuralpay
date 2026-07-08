// apps/server/notification-service/src/test-notif.ts
import { emitNotification } from "@neuralpay/redis";
import { config } from "dotenv";
config({ path: "../../../.env" });

const USER_ID = "lMpHXrQwQhCSRHZ9cXQ3YCPFK5UTlM3K";

const events = [
  // ── Transactions
  {
    event: {
      type: "transaction_created" as const,
      payload: {
        userId: USER_ID,
        transactionId: "tx-001",
        amount: 4500.0,
        currency: "USD",
        merchant: "Apple Store",
        category: "shopping",
      },
    },
  },
  {
    event: {
      type: "transaction_anomaly" as const,
      payload: {
        userId: USER_ID,
        transactionId: "tx-002",
        amount: 89000.0,
        merchant: "Unknown Vendor",
        score: 0.97,
        reason: "Unusually large transaction compared to your spending history",
      },
    },
  },

  // ── Budget
  {
    event: {
      type: "budget_threshold" as const,
      payload: {
        userId: USER_ID,
        budgetId: "budget-001",
        category: "food_dining",
        spent: 850,
        limit: 1000,
        percentage: 85,
      },
    },
  },

  // ── Accounts
  {
    event: {
      type: "account_connected" as const,
      payload: {
        userId: USER_ID,
        accountId: "acc-001",
        bankName: "Chase Bank",
        accountType: "checking",
      },
    },
  },
  {
    event: {
      type: "account_disconnected" as const,
      payload: {
        userId: USER_ID,
        accountId: "acc-002",
        bankName: "Wells Fargo",
      },
    },
  },
  {
    event: {
      type: "account_sync_failed" as const,
      payload: {
        userId: USER_ID,
        accountId: "acc-003",
        bankName: "Bank of America",
        error: "Session expired — please reconnect your account",
      },
    },
  },

  // ── Splits
  {
    event: {
      type: "split_invite" as const,
      payload: {
        userId: USER_ID,
        splitId: "split-001",
        invitedBy: "user-abc",
        invitedByName: "James Okon",
        amount: 12500,
        currency: "USD",
        title: "Lagos Trip — Hotel & Flights",
      },
    },
  },
  {
    event: {
      type: "split_paid" as const,
      payload: {
        userId: USER_ID,
        splitId: "split-001",
        payerName: "Amara Chukwu",
        amount: 6250,
        title: "Lagos Trip — Hotel & Flights",
      },
    },
  },
  {
    event: {
      type: "split_settled" as const,
      payload: {
        userId: USER_ID,
        splitId: "split-001",
        title: "Lagos Trip — Hotel & Flights",
        settledBy: "James Okon",
      },
    },
  },
  {
    event: {
      type: "split_reminder" as const,
      payload: {
        userId: USER_ID,
        splitId: "split-002",
        title: "Team Lunch",
        amountOwed: 3200,
        currency: "USD",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  },

  // ── Vaults
  {
    event: {
      type: "vault_milestone" as const,
      payload: {
        userId: USER_ID,
        vaultId: "vault-001",
        vaultName: "Emergency Fund",
        milestone: 50 as const,
        current: 5000,
        target: 10000,
        currency: "USD",
      },
    },
  },
  {
    event: {
      type: "vault_contribution" as const,
      payload: {
        userId: USER_ID,
        vaultId: "vault-001",
        vaultName: "Emergency Fund",
        contributorName: "David Jacobs",
        amount: 500,
        currency: "USD",
      },
    },
  },
  {
    event: {
      type: "vault_invite" as const,
      payload: {
        userId: USER_ID,
        vaultId: "vault-002",
        vaultName: "Startup Fund 2026",
        invitedBy: "Sarah Tech",
      },
    },
  },

  // ── AI
  {
    event: {
      type: "ai_insight" as const,
      payload: {
        userId: USER_ID,
        insightId: "insight-001",
        title: "You spend 40% more on weekends",
        description:
          "Your weekend spending averages $320 vs $190 on weekdays. Consider setting a weekend budget.",
        severity: "medium" as const,
        category: "spending_pattern",
      },
    },
  },
  {
    event: {
      type: "ai_weekly_report" as const,
      payload: {
        userId: USER_ID,
        reportId: "report-001",
        summary:
          "You stayed within budget this week. Top spending was on food & dining.",
        healthScore: 78,
        topCategory: "food_dining",
        totalSpent: 1240,
      },
    },
  },
  {
    event: {
      type: "ai_coach_response" as const,
      payload: {
        userId: USER_ID,
        sessionId: "session-001",
        message:
          "Based on your spending, I recommend setting aside $500/month for investments.",
        topic: "investment_advice",
      },
    },
  },

  // ── Subscriptions
  {
    event: {
      type: "subscription_renewed" as const,
      payload: {
        userId: USER_ID,
        plan: "Pro",
        renewalDate: new Date().toISOString(),
        amount: 29.99,
      },
    },
  },
  {
    event: {
      type: "subscription_expiring" as const,
      payload: {
        userId: USER_ID,
        daysLeft: 3,
        plan: "Pro",
        renewalDate: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    },
  },
  {
    event: {
      type: "subscription_cancelled" as const,
      payload: {
        userId: USER_ID,
        plan: "Pro",
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  },

  // ── System
  {
    event: {
      type: "system_maintenance" as const,
      payload: {
        userId: USER_ID,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 30,
        message:
          "NeuralPay will be briefly unavailable for scheduled maintenance.",
      },
    },
  },
  {
    event: {
      type: "system_welcome" as const,
      payload: {
        userId: USER_ID,
        userName: "David Jacobs",
      },
    },
  },
];

// Fire all or pick one by index
const args = process.argv.slice(2);
const index = args[0] ? parseInt(args[0]) : null;

if (index !== null && events[index]) {
  const ev = events[index]!;
  await emitNotification(ev);
  console.log(`✅ Fired: ${ev.event.type}`);
} else {
  // Fire all with a small delay between each so SSE doesn't batch them
  for (const ev of events) {
    await emitNotification(ev);
    console.log(`✅ Fired: ${ev.event.type}`);
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`\n🎉 All ${events.length} notification types fired`);
}
