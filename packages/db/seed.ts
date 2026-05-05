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

  // 1. Get existing user
  const user = await db.query.user.findFirst();
  if (!user) {
    console.log("No user found. Please sign up first, then run seed.");
    process.exit(1);
  }
  const userId = user.id;

  // 2. Clean existing data in dependency order
  await db.delete(notifications);
  await db.delete(chatMessages);
  await db.delete(chatSessions);
  await db.delete(vaultContributions);
  await db.delete(vaultMembers);
  await db.delete(vaults);
  await db.delete(splitChatMessages);
  await db.delete(splitParticipants);
  await db.delete(splits);
  await db.delete(spendingInsights);
  await db.delete(transactions);
  await db.delete(bankAccounts);

  // 3. Insert accounts
  const [checkingAcc, , creditAcc] = await db
    .insert(bankAccounts)
    .values([
      {
        userId,
        name: "Main Checking",
        type: "checking" as const,
        balance: "5420.75",
        currency: "USD",
        bankName: "Chase",
        source: "manual",
        isVerified: true,
        status: "active",
      },
      {
        userId,
        name: "Savings",
        type: "savings" as const,
        balance: "12350.00",
        currency: "USD",
        bankName: "Chase",
        source: "manual",
        isVerified: true,
        status: "active",
      },
      {
        userId,
        name: "Credit Card",
        type: "credit" as const,
        balance: "-230.45",
        currency: "USD",
        bankName: "Amex",
        source: "manual",
        isVerified: true,
        status: "active",
      },
    ])
    .returning();

  if (!checkingAcc || !creditAcc) {
    console.error("Failed to insert bank accounts");
    process.exit(1);
  }

  // 4. Insert transactions — typed explicitly to avoid enum widening
  const now = new Date();

  const transactionsData: (typeof transactions.$inferInsert)[] = [
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Starbucks",
      amount: "5.75",
      type: "debit",
      status: "posted",
      category: "food_dining",
      merchant: "Starbucks",
      date: new Date(now.getTime() - 2 * 86400000),
      isAnomaly: false,
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Netflix Subscription",
      amount: "15.99",
      type: "debit",
      status: "posted",
      category: "subscriptions",
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
      status: "posted",
      category: "transport",
      merchant: "Uber",
      date: new Date(now.getTime() - 7 * 86400000),
      isAnomaly: false,
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Whole Foods",
      amount: "67.30",
      type: "debit",
      status: "posted",
      category: "groceries",
      merchant: "Whole Foods",
      date: new Date(now.getTime() - 9 * 86400000),
      isAnomaly: false,
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Salary — Employer Inc",
      amount: "4500.00",
      type: "credit",
      status: "posted",
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
      status: "posted",
      category: "shopping",
      merchant: "Amazon",
      date: new Date(now.getTime() - 12 * 86400000),
      isAnomaly: false,
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Club XYZ — Late Night",
      amount: "150.00",
      type: "debit",
      status: "posted",
      category: "entertainment",
      merchant: "Club XYZ",
      date: new Date(now.getTime() - 14 * 86400000),
      isAnomaly: true,
      anomalyScore: "0.92",
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Electricity Bill",
      amount: "85.00",
      type: "debit",
      status: "posted",
      category: "utilities",
      merchant: "City Power",
      date: new Date(now.getTime() - 20 * 86400000),
      isAnomaly: false,
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Spotify Premium",
      amount: "9.99",
      type: "debit",
      status: "posted",
      category: "subscriptions",
      merchant: "Spotify",
      date: new Date(now.getTime() - 25 * 86400000),
      isAnomaly: false,
    },
    {
      bankAccountId: checkingAcc.id,
      userId,
      description: "Rent — April",
      amount: "1200.00",
      type: "debit",
      status: "posted",
      category: "rent",
      merchant: "Landlord LLC",
      date: new Date(now.getTime() - 30 * 86400000),
      isAnomaly: false,
    },
  ];

  await db.insert(transactions).values(transactionsData);

  // 5. Insert spending insights
  await db.insert(spendingInsights).values([
    {
      userId,
      type: "anomaly",
      title: "Unusual spending detected",
      description:
        "You spent $150 at Club XYZ — 3x your typical entertainment spend.",
      severity: "medium",
      category: "entertainment",
      generatedAt: new Date(),
    },
    {
      userId,
      type: "opportunity",
      title: "Subscription audit recommended",
      description:
        "You're spending $25.98/month on streaming. Consider consolidating.",
      severity: "low",
      category: "subscriptions",
      generatedAt: new Date(),
    },
    {
      userId,
      type: "trend",
      title: "Grocery spend is on target",
      description:
        "Your grocery spending this month is within your usual range. Keep it up.",
      severity: "low",
      category: "groceries",
      generatedAt: new Date(),
    },
  ]);

  // 6. Insert split
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
    console.error("Failed to insert split");
    process.exit(1);
  }

  await db.insert(splitParticipants).values([
    {
      splitId: split1.id,
      userId, // registered user — paid their share
      shareAmount: "42.75",
      paid: true,
      paidAt: new Date(now.getTime() - 2 * 86400000),
    },
    {
      splitId: split1.id,
      userId: null, // guest — not registered
      guestName: "Sarah",
      guestEmail: "sarah@example.com",
      shareAmount: "42.75",
      paid: false,
    },
  ]);

  await db.insert(splitChatMessages).values([
    {
      splitId: split1.id,
      userId,
      content: "Hey everyone! I've created the split for dinner 🍽️",
      isSystemMessage: false,
    },
    {
      splitId: split1.id,
      userId,
      content: "Split created: Dinner with Friends — $85.50 total",
      isSystemMessage: true,
    },
  ]);

  // 7. Insert vault
  const [vault] = await db
    .insert(vaults)
    .values({
      userId,
      name: "Trip to Bali",
      description: "Saving up for a 2-week Bali trip with friends",
      targetAmount: "2000.00",
      currentAmount: "450.00",
      currency: "USD",
      category: "vacation",
      targetDate: new Date(now.getFullYear(), now.getMonth() + 6, 1),
      color: "#7C3AED",
    })
    .returning();

  if (!vault) {
    console.error("Failed to insert vault");
    process.exit(1);
  }

  await db.insert(vaultMembers).values({
    vaultId: vault.id,
    userId,
    role: "owner",
  });

  await db.insert(vaultContributions).values([
    {
      vaultId: vault.id,
      userId,
      amount: "200.00",
      notes: "Initial deposit",
      createdAt: new Date(now.getTime() - 20 * 86400000),
    },
    {
      vaultId: vault.id,
      userId,
      amount: "250.00",
      notes: "Month 2 contribution",
      createdAt: new Date(now.getTime() - 5 * 86400000),
    },
  ]);

  // 8. Insert AI chat session + messages
  const [chatSession] = await db
    .insert(chatSessions)
    .values({
      userId,
      title: "Help with monthly budget",
      topic: "budgeting",
      isActive: true,
    })
    .returning();

  if (!chatSession) {
    console.error("Failed to insert chat session");
    process.exit(1);
  }

  await db.insert(chatMessages).values([
    {
      sessionId: chatSession.id,
      userId,
      role: "user",
      content: "How can I save more this month?",
    },
    {
      sessionId: chatSession.id,
      userId,
      role: "assistant",
      content:
        "Based on your spending, your subscriptions total $25.98/month. " +
        "Reducing dining out by 20% could save another ~$30. " +
        "Together that's roughly $55 you could redirect to your Bali vault.",
      tokensUsed: 148,
    },
    {
      sessionId: chatSession.id,
      userId,
      role: "user",
      content: "What about the anomaly you flagged?",
    },
    {
      sessionId: chatSession.id,
      userId,
      role: "assistant",
      content:
        "The $150 Club XYZ transaction was 3x your usual entertainment spend for a single transaction. " +
        "I flagged it because it occurred at 2am and at a merchant you've never visited before. " +
        "Was this intentional?",
      tokensUsed: 96,
    },
  ]);

  // 9. Insert notifications
  await db.insert(notifications).values([
    {
      userId,
      type: "warning",
      title: "Unusual transaction detected",
      body: "We noticed a $150 transaction at Club XYZ. Was this you?",
      category: "transaction",
      relatedType: "transaction",
      read: false,
      dismissed: false,
      createdAt: new Date(now.getTime() - 14 * 86400000),
    },
    {
      userId,
      type: "info",
      title: "Sarah hasn't paid yet",
      body: "Your split 'Dinner with Friends' has 1 pending payment from Sarah.",
      category: "split",
      relatedType: "split",
      relatedId: split1.id,
      actionUrl: `/dashboard/splits/${split1.id}`,
      read: false,
      dismissed: false,
      createdAt: new Date(now.getTime() - 2 * 86400000),
    },
    {
      userId,
      type: "success",
      title: "Vault milestone — 22%",
      body: "Your 'Trip to Bali' vault is 22% funded. Keep going! 🎉",
      category: "vault",
      relatedType: "vault",
      relatedId: vault.id,
      actionUrl: `/dashboard/vaults/${vault.id}`,
      read: true,
      dismissed: false,
      createdAt: new Date(now.getTime() - 5 * 86400000),
    },
  ]);

  console.log("✅ Seeding complete!");
  console.log(`   User: ${user.email}`);
  console.log(`   Accounts: 3 (checking, savings, credit)`);
  console.log(`   Transactions: ${transactionsData.length}`);
  console.log(`   Insights: 3`);
  console.log(`   Splits: 1 (1 open, Sarah pending)`);
  console.log(`   Vaults: 1 (Bali — 22% funded)`);
  console.log(`   Chat messages: 4`);
  console.log(`   Notifications: 3`);
}

seed().catch(console.error);
