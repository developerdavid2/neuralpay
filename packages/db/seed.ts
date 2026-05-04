import { db } from "./src";
import { chatMessages, chatSessions } from "./src/schema/ai";
import { notifications } from "./src/schema/notifications";
import {
  splitChatMessages,
  splitParticipants,
  splits,
} from "./src/schema/splits";
import {
  bankAccounts,
  spendingInsights,
  transactions,
} from "./src/schema/transactions";
import { vaultContributions, vaultMembers, vaults } from "./src/schema/vaults";

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Get existing user (assume you have a user already via signup)
  // Alternatively, create a test user if none exists.
  let user = await db.query.user.findFirst();
  if (!user) {
    console.log("No user found. Please sign up first, then run seed.");
    process.exit(1);
  }
  const userId = user.id;

  // 2. Clean existing data (optional, careful)
  await db.delete(transactions);
  await db.delete(bankAccounts);
  await db.delete(spendingInsights);
  await db.delete(splitChatMessages);
  await db.delete(splitParticipants);
  await db.delete(splits);
  await db.delete(vaultContributions);
  await db.delete(vaultMembers);
  await db.delete(vaults);
  await db.delete(chatMessages);
  await db.delete(chatSessions);
  await db.delete(notifications);

  // 3. Insert accounts
  const [checkingAcc, savingsAcc, creditAcc] = await db
    .insert(bankAccounts)
    .values([
      {
        userId,
        name: "Main Checking",
        type: "checking",
        balance: "5420.75",
        currency: "USD",
        bankName: "Chase",
        source: "manual",
        isVerified: true,
      },
      {
        userId,
        name: "Savings",
        type: "savings",
        balance: "12350.00",
        currency: "USD",
        bankName: "Chase",
        source: "manual",
        isVerified: true,
      },
      {
        userId,
        name: "Credit Card",
        type: "credit",
        balance: "-230.45",
        currency: "USD",
        bankName: "Amex",
        source: "manual",
        isVerified: true,
      },
    ])
    .returning();

  // 4. Insert transactions (mix of categories, some anomalies)
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  if (!checkingAcc) {
    return;
  }

  if (!creditAcc) {
    return;
  }

  const transactionsData = [
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Starbucks",
      amount: "5.75",
      type: "debit",
      category: "food_dining",
      merchant: "Starbucks",
      date: new Date(now.getTime() - 2 * 86400000),
      isAnomaly: false,
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Netflix",
      amount: "15.99",
      type: "debit",
      category: "entertainment",
      merchant: "Netflix",
      date: new Date(now.getTime() - 5 * 86400000),
      isAnomaly: false,
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Uber",
      amount: "22.50",
      type: "debit",
      category: "transport",
      merchant: "Uber",
      date: new Date(now.getTime() - 7 * 86400000),
      isAnomaly: false,
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Salary",
      amount: "4500.00",
      type: "credit",
      category: "income",
      merchant: "Employer Inc",
      date: new Date(now.getTime() - 10 * 86400000),
      isAnomaly: false,
    },
    {
      bankAccountId: creditAcc.id,
      userId,
      description: "Amazon Purchase",
      amount: "89.99",
      type: "debit",
      category: "shopping",
      merchant: "Amazon",
      date: new Date(now.getTime() - 12 * 86400000),
      isAnomaly: false,
      anomalyScore: "0.85",
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Weird Late Night",
      amount: "150.00",
      type: "debit",
      category: "entertainment",
      merchant: "Club XYZ",
      date: new Date(now.getTime() - 14 * 86400000),
      isAnomaly: true,
      anomalyScore: "0.92",
    },
  ] as const satisfies Omit<
    typeof transactions.$inferInsert,
    "id" | "createdAt" | "status"
  >[];
  await db.insert(transactions).values(transactionsData);

  // 5. Insert AI insight
  await db.insert(spendingInsights).values({
    userId,
    type: "anomaly",
    title: "Unusual spending detected",
    description:
      "You spent $150 at Club XYZ, which is 3x your typical entertainment expense.",
    severity: "medium",
    category: "entertainment",
    generatedAt: new Date(),
  });

  // 6. Insert splits
  const [split1] = await db
    .insert(splits)
    .values({
      creatorId: userId,
      title: "Dinner with Friends",
      totalAmount: "85.50",
      currency: "USD",
      category: "dining",
      status: "open",
    })
    .returning();

  if (!split1) {
    return;
  }
  // Add participants (self + mock other users if they exist, otherwise just self)
  await db.insert(splitParticipants).values([
    { splitId: split1.id, userId, shareAmount: "42.75", paid: true },
    { splitId: split1.id, userId: userId, shareAmount: "42.75", paid: false }, // Actually need other user ID. For seed, we'll just duplicate for demo.
  ]);

  // 7. Insert vault
  const [vault] = await db
    .insert(vaults)
    .values({
      userId,
      name: "Trip to Bali",
      targetAmount: "2000",
      currentAmount: "450",
      currency: "USD",
      category: "vacation",
      targetDate: new Date(now.getFullYear(), now.getMonth() + 6, 1),
    })
    .returning();

  if (!vault) {
    return;
  }

  await db.insert(vaultMembers).values({
    vaultId: vault.id,
    userId,
    role: "owner",
  });

  await db.insert(vaultContributions).values({
    vaultId: vault.id,
    userId,
    amount: "450",
    notes: "Initial savings",
  });

  // 8. Insert chat session +
  const [session] = await db
    .insert(chatSessions)
    .values({
      userId,
      title: "Help with budget",
      topic: "budgeting",
    })
    .returning();

  if (!session) {
    return;
  }
  await db.insert(chatMessages).values([
    {
      sessionId: session.id,
      role: "user",
      content: "How can I save more this month?",
    },
    {
      sessionId: session.id,
      role: "assistant",
      content:
        "Based on your spending, reducing dining out by 20% could save ~$150.",
      tokensUsed: 120,
    },
  ]);

  // 9. Insert a notification
  await db.insert(notifications).values({
    userId,
    type: "warning",
    title: "Unusual transaction detected",
    body: "We noticed a $150 transaction at Club XYZ. Was this you?",
    category: "transaction",
    createdAt: new Date(),
  });

  console.log("✅ Seeding complete!");
}

seed().catch(console.error);
