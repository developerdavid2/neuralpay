import { db } from "./src";
import { bankAccounts } from "./src/schema/accounts";
import { insights } from "./src/schema/insights";
import { chatMessages, chatSessions } from "./src/schema/chats";
import { budgets } from "./src/schema/budgets";
import { notifications } from "./src/schema/notifications";
import {
  splitChatMessages,
  splitParticipants,
  splits,
} from "./src/schema/splits";
import {
  csvImports,
  transactionTagMapping,
  transactionTags,
  transactions,
} from "./src/schema/transactions";
import { vaultContributions, vaultMembers, vaults } from "./src/schema/vaults";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function randomAmount(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// Covers all system category enum values except "income" (handled separately)
const CATEGORY_SEEDS = [
  {
    category: "food_dining" as const,
    weight: 25,
    min: 5,
    max: 85,
    merchants: [
      "Starbucks",
      "Chipotle",
      "McDonald's",
      "Pizza Hut",
      "Local Bistro",
      "Sushi Place",
      "Taco Bell",
      "Panera Bread",
      "Five Guys",
      "Shake Shack",
    ],
  },
  {
    category: "groceries" as const,
    weight: 20,
    min: 25,
    max: 180,
    merchants: [
      "Whole Foods",
      "Trader Joe's",
      "Kroger",
      "Safeway",
      "Costco",
      "Aldi",
      "Walmart",
      "Target Grocery",
      "Instacart",
    ],
  },
  {
    category: "transport" as const,
    weight: 15,
    min: 8,
    max: 45,
    merchants: [
      "Uber",
      "Lyft",
      "Shell",
      "Exxon",
      "BP",
      "City Transit",
      "Parking Garage",
      "Enterprise",
      "Hertz",
    ],
  },
  {
    category: "subscriptions" as const,
    weight: 10,
    min: 5,
    max: 25,
    merchants: [
      "Netflix",
      "Spotify",
      "Amazon Prime",
      "Disney+",
      "Hulu",
      "YouTube Premium",
      "Apple Music",
      "GitHub",
      "Figma",
      "Notion",
    ],
  },
  {
    category: "shopping" as const,
    weight: 12,
    min: 15,
    max: 250,
    merchants: [
      "Amazon",
      "Target",
      "Best Buy",
      "Nike",
      "Zara",
      "H&M",
      "Etsy",
      "eBay",
      "Apple Store",
      "Sephora",
    ],
  },
  {
    category: "entertainment" as const,
    weight: 8,
    min: 20,
    max: 150,
    merchants: [
      "AMC Theaters",
      "Concert Hall",
      "Bowling Alley",
      "Arcade",
      "Comedy Club",
      "Sports Bar",
    ],
  },
  {
    category: "utilities" as const,
    weight: 5,
    min: 60,
    max: 200,
    merchants: [
      "City Power",
      "Water Works",
      "Gas Company",
      "Internet Provider",
      "Phone Company",
      "Trash Service",
    ],
  },
  {
    category: "rent" as const,
    weight: 3,
    min: 800,
    max: 1200,
    merchants: [
      "Landlord LLC",
      "Property Management",
      "Apartment Complex",
      "Rent Office",
    ],
  },
  {
    category: "healthcare" as const,
    weight: 2,
    min: 25,
    max: 120,
    merchants: [
      "CVS Pharmacy",
      "Walgreens",
      "Doctor Office",
      "Dentist",
      "Gym Membership",
      "Therapy Session",
    ],
  },
  {
    category: "education" as const,
    weight: 2,
    min: 15,
    max: 300,
    merchants: [
      "Coursera",
      "Udemy",
      "University Bookstore",
      "LinkedIn Learning",
      "Skillshare",
      "Pluralsight",
    ],
  },
  {
    category: "transfer" as const,
    weight: 4,
    min: 50,
    max: 500,
    merchants: [
      "Internal Transfer",
      "Zelle Payment",
      "Wire Transfer",
      "ACH Transfer",
      "Venmo",
    ],
  },
  {
    category: "investment" as const,
    weight: 3,
    min: 100,
    max: 1000,
    merchants: [
      "Robinhood",
      "Fidelity",
      "Vanguard",
      "Coinbase",
      "E*Trade",
      "Charles Schwab",
    ],
  },
  {
    category: "other" as const,
    weight: 2,
    min: 10,
    max: 100,
    merchants: ["Miscellaneous", "Unknown Merchant", "Adjustments", "Fees"],
  },
] as const;

function weightedRandom<T>(items: { item: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let random = Math.random() * total;
  for (const { item, weight } of items) {
    random -= weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1]!.item;
}

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Get existing user
  const existingUser = await db.query.user.findFirst();
  if (!existingUser) {
    console.log("No user found. Please sign up first, then run seed.");
    process.exit(1);
  }
  const userId = existingUser.id;

  // 2. Clean existing data in dependency order (respect FKs)
  await db.delete(transactionTagMapping);
  await db.delete(transactionTags);
  await db.delete(chatMessages);
  await db.delete(chatSessions);
  await db.delete(vaultContributions);
  await db.delete(vaultMembers);
  await db.delete(vaults);
  await db.delete(splitChatMessages);
  await db.delete(splitParticipants);
  await db.delete(splits);
  await db.delete(transactions);
  await db.delete(csvImports);
  await db.delete(insights);
  await db.delete(budgets);
  await db.delete(bankAccounts);
  await db.delete(notifications);

  // 3. Insert bank accounts (all 5 account_type enum values)
  const [checkingAcc, savingsAcc, creditAcc, investmentAcc, cryptoAcc] =
    await db
      .insert(bankAccounts)
      .values([
        {
          userId,
          name: "Main Checking",
          type: "checking" as const,
          subtype: "Primary",
          tags: ["primary", "usa"],
          balance: "5420.75",
          currency: "USD",
          bankName: "Chase",
          maskedNumber: "1234",
          isManual: true,
          status: "active",
        },
        {
          userId,
          name: "Savings",
          type: "savings" as const,
          subtype: "Emergency Fund",
          tags: ["savings", "usa"],
          balance: "12350.00",
          currency: "USD",
          bankName: "Chase",
          maskedNumber: "5678",
          isManual: true,
          status: "active",
        },
        {
          userId,
          name: "Credit Card",
          type: "credit" as const,
          subtype: "Rewards",
          tags: ["credit", "usa"],
          balance: "-230.45",
          currency: "USD",
          bankName: "Amex",
          maskedNumber: "9012",
          isManual: true,
          status: "active",
        },
        {
          userId,
          name: "Brokerage",
          type: "investment" as const,
          subtype: "ETF Portfolio",
          tags: ["investment", "usa"],
          balance: "8750.00",
          currency: "USD",
          bankName: "Fidelity",
          maskedNumber: "3456",
          isManual: true,
          status: "active",
        },
        {
          userId,
          name: "Crypto Wallet",
          type: "crypto" as const,
          subtype: "DeFi",
          tags: ["crypto", "web3"],
          balance: "1200.50",
          currency: "USD",
          bankName: "Coinbase",
          maskedNumber: "7890",
          isManual: true,
          status: "active",
        },
      ])
      .returning();

  if (!checkingAcc || !creditAcc) {
    console.error("Failed to insert essential bank accounts");
    process.exit(1);
  }

  // 4. Insert budgets for ALL 14 system category enum values
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const allSystemCategories = [
    "food_dining",
    "utilities",
    "rent",
    "transport",
    "shopping",
    "entertainment",
    "healthcare",
    "education",
    "transfer",
    "income",
    "investment",
    "subscriptions",
    "groceries",
    "other",
  ] as const;

  await db.insert(budgets).values(
    allSystemCategories.map((cat) => ({
      userId,
      category: cat,
      limitAmount:
        cat === "rent"
          ? "1200.00"
          : cat === "income"
            ? "5000.00"
            : cat === "investment"
              ? "1000.00"
              : "300.00",
      month: currentMonth,
      year: currentYear,
      alertThreshold: 80,
      resetDay: 1,
    })),
  );

  // 6. Insert CSV imports (demonstrates csvImportId linkage)
  const [csvImport1] = await db
    .insert(csvImports)
    .values({
      userId,
      bankAccountId: checkingAcc.id,
      filename: "q1_statement.csv",
      totalRows: 150,
      importedRows: 148,
      skippedRows: 2,
      status: "completed",
      columnMapping: JSON.stringify({ date: 0, description: 1, amount: 2 }),
    })
    .returning();

  // 7. Insert transaction tags
  const [tagWork, tagPersonal, tagTax] = await db
    .insert(transactionTags)
    .values([
      { userId, name: "Work", color: "#2563EB" },
      { userId, name: "Personal", color: "#DB2777" },
      { userId, name: "Tax-Deductible", color: "#059669" },
    ])
    .returning();

  // 8. Insert transactions — 90 days covering all categories, statuses & new fields
  const transactionsData: (typeof transactions.$inferInsert)[] = [];

  function getTransactionStatus(
    date: Date,
  ): "pending" | "successful" | "refunded" | "reversed" | "failed" {
    const now = Date.now();
    const ageMs = now - date.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const roll = Math.random();

    // Recent 3 days: higher chance of pending / failed
    if (ageDays <= 3) {
      if (roll < 0.2) return "pending";
      if (roll < 0.25) return "failed";
      return "successful";
    }

    // Older than 3 days: settled transactions
    if (roll < 0.02) return "failed";
    if (roll < 0.06) return "refunded";
    if (roll < 0.09) return "reversed";
    if (roll < 0.095) return "pending";
    return "successful";
  }

  // Daily randomized transactions
  for (let day = 89; day >= 0; day--) {
    const date = daysAgo(day);
    const numTransactions = Math.floor(Math.random() * 3) + 1;

    for (let t = 0; t < numTransactions; t++) {
      const catInfo = weightedRandom(
        CATEGORY_SEEDS.map((c) => ({ item: c, weight: c.weight })),
      );
      const merchant =
        catInfo.merchants[Math.floor(Math.random() * catInfo.merchants.length)];
      const amount = randomAmount(catInfo.min, catInfo.max);
      const status = getTransactionStatus(date);

      const isAnomaly =
        (catInfo.category === "entertainment" ||
          catInfo.category === "shopping") &&
        Math.random() < 0.05;

      transactionsData.push({
        bankAccountId: Math.random() > 0.3 ? checkingAcc.id : creditAcc.id,
        userId,
        description: merchant ?? "",
        amount,
        type: "debit",
        status,
        category: catInfo.category,

        merchant,
        date,
        isAnomaly,
        anomalyScore: isAnomaly ? (0.7 + Math.random() * 0.3).toFixed(4) : null,
        notes: Math.random() > 0.7 ? `Note: ${merchant} purchase` : null,
        isManual: Math.random() > 0.8, // 20% manual entries
        plaidTxId: null,
        monoTxId: null,
        csvImportId: null,
      });
    }
  }

  // Income transactions (salary every ~30 days)
  const incomeDates = [10, 40, 70];
  for (const days of incomeDates) {
    const date = daysAgo(days);
    const status = getTransactionStatus(date);
    transactionsData.push({
      bankAccountId: checkingAcc.id,
      userId,
      description: "Salary — Employer Inc",
      amount: "4500.00",
      type: "credit",
      status,
      category: "income",
      merchant: "Employer Inc",
      date,
      isAnomaly: false,
      anomalyScore: null,
      notes: "Monthly salary deposit",
      isManual: false,
      plaidTxId: `plaid_salary_${days}`,
      monoTxId: null,
      csvImportId: null,
    });
  }

  // Freelance income
  transactionsData.push({
    bankAccountId: checkingAcc.id,
    userId,
    description: "Freelance Payment — Design Project",
    amount: "850.00",
    type: "credit",
    status: getTransactionStatus(daysAgo(25)),
    category: "income",
    merchant: "Upwork Client",
    date: daysAgo(25),
    isAnomaly: false,
    anomalyScore: null,
    notes: "Invoice #2049",
    isManual: false,
    plaidTxId: null,
    monoTxId: `mono_fl_${Date.now()}`,
    csvImportId: null,
  });

  // CSV-imported transactions
  if (csvImport1) {
    transactionsData.push(
      {
        bankAccountId: checkingAcc.id,
        userId,
        description: "Imported Grocery Run",
        amount: "67.89",
        type: "debit",
        status: "successful",
        category: "groceries",
        merchant: "Imported Store",
        date: daysAgo(12),
        isAnomaly: false,
        anomalyScore: null,
        notes: "From CSV import",
        isManual: false,
        plaidTxId: null,
        monoTxId: null,
        csvImportId: csvImport1.id,
      },
      {
        bankAccountId: checkingAcc.id,
        userId,
        description: "Imported Utility",
        amount: "95.00",
        type: "debit",
        status: "successful",
        category: "utilities",
        merchant: "Imported Utility Co",
        date: daysAgo(11),
        isAnomaly: false,
        anomalyScore: null,
        notes: "From CSV import",
        isManual: false,
        plaidTxId: null,
        monoTxId: null,
        csvImportId: csvImport1.id,
      },
    );
  }

  // Explicit status coverage (ensure every enum value appears at least once)
  const explicitStatuses: Array<
    "pending" | "successful" | "refunded" | "reversed" | "failed"
  > = ["pending", "successful", "refunded", "reversed", "failed"];
  explicitStatuses.forEach((st, idx) => {
    transactionsData.push({
      bankAccountId: checkingAcc.id,
      userId,
      description: `Status demo: ${st}`,
      amount: (50 + idx * 10).toFixed(2),
      type: "debit",
      status: st,
      category: "other",
      merchant: "Test Merchant",
      date: daysAgo(5 + idx),
      isAnomaly: st === "failed" || st === "reversed",
      anomalyScore: st === "failed" || st === "reversed" ? "0.8500" : null,
      notes: `Explicitly seeded to demonstrate ${st} status`,
      isManual: true,
      plaidTxId: null,
      monoTxId: null,
      csvImportId: null,
    });
  });

  const insertedTxs = await db
    .insert(transactions)
    .values(transactionsData)
    .returning();

  // 9. Map tags to transactions
  if (insertedTxs.length > 0 && tagWork && tagPersonal) {
    const tagMappings: { transactionId: string; tagId: string }[] = [];
    const incomeTxs = insertedTxs
      .filter((t) => t.category === "income")
      .slice(0, 2);
    for (const tx of incomeTxs) {
      tagMappings.push({ transactionId: tx.id, tagId: tagWork.id });
    }
    const shoppingTxs = insertedTxs
      .filter((t) => t.category === "shopping")
      .slice(0, 2);
    for (const tx of shoppingTxs) {
      tagMappings.push({ transactionId: tx.id, tagId: tagPersonal.id });
    }
    if (tagMappings.length > 0) {
      await db.insert(transactionTagMapping).values(tagMappings);
    }
  }

  // 10. Insert spending insights
  await db.insert(insights).values([
    {
      userId,
      type: "anomaly",
      title: "Unusual spending detected",
      description:
        "You spent $150 at Club XYZ — 3x your typical entertainment spend.",
      severity: "medium",
      category: "entertainment",
      generatedAt: daysAgo(14),
    },
    {
      userId,
      type: "opportunity",
      title: "Subscription audit recommended",
      description:
        "You're spending $45.97/month on streaming. Consider consolidating.",
      severity: "low",
      category: "subscriptions",
      generatedAt: daysAgo(5),
    },
    {
      userId,
      type: "trend",
      title: "Grocery spend is on target",
      description:
        "Your grocery spending this month is within your usual range. Keep it up!",
      severity: "low",
      category: "groceries",
      generatedAt: daysAgo(2),
    },
    {
      userId,
      type: "warning",
      title: "Budget threshold approaching",
      description:
        "You've used 85% of your dining budget. Consider cooking at home this weekend.",
      severity: "medium",
      category: "food_dining",
      generatedAt: daysAgo(1),
    },
    {
      userId,
      type: "opportunity",
      title: "Savings opportunity detected",
      description:
        "You could save $120/month by switching to a lower-tier phone plan.",
      severity: "low",
      category: "utilities",
      generatedAt: daysAgo(3),
    },
  ]);

  // 11. Insert split
  const [splitOpen, splitSettled, splitCancelled] = await db
    .insert(splits)
    .values([
      {
        creatorId: userId,
        title: "Dinner with Friends",
        description: "Friday night group dinner at Italian place",
        totalAmount: "85.50",
        currency: "USD",
        category: "food_dining", // ← valid categoryEnum value
        paidById: userId, // ← who fronted the bill
        status: "open",
        settledAt: null,
      },
      {
        creatorId: userId,
        title: "Uber to Airport",
        description: "Shared ride to JFK — already settled",
        totalAmount: "45.00",
        currency: "USD",
        category: "transport",
        paidById: userId,
        status: "settled",
        settledAt: daysAgo(5),
      },
      {
        creatorId: userId,
        title: "Concert Tickets",
        description: "Cancelled — event was postponed",
        totalAmount: "120.00",
        currency: "USD",
        category: "entertainment",
        paidById: userId,
        status: "cancelled",
        settledAt: null,
      },
    ])
    .returning();

  if (!splitOpen || !splitSettled) {
    console.error("Failed to insert splits");
    process.exit(1);
  }

  // Participants for OPEN split (1 paid, 1 pending)
  await db.insert(splitParticipants).values([
    {
      splitId: splitOpen.id,
      userId,
      shareAmount: "42.75",
      paid: true,
      paidAt: daysAgo(2),
      notes: "Paid via Venmo",
    },
    {
      splitId: splitOpen.id,
      userId: null,
      guestName: "Sarah",
      guestEmail: "sarah@example.com",
      shareAmount: "42.75",
      paid: false,
      notes: null,
    },
  ]);

  // Participants for SETTLED split (both paid)
  await db.insert(splitParticipants).values([
    {
      splitId: splitSettled.id,
      userId,
      shareAmount: "22.50",
      paid: true,
      paidAt: daysAgo(6),
      notes: "Paid cash",
    },
    {
      splitId: splitSettled.id,
      userId: null,
      guestName: "Mike",
      guestEmail: "mike@example.com",
      shareAmount: "22.50",
      paid: true,
      paidAt: daysAgo(5),
      notes: "Zelle transfer",
    },
  ]);

  // No participants for CANCELLED split (or add refunded ones)

  // Chat messages with full timestamp coverage
  await db.insert(splitChatMessages).values([
    {
      splitId: splitOpen.id,
      userId,
      content: "Hey everyone! I've created the split for dinner 🍽️",
      isSystemMessage: false,
      createdAt: daysAgo(3),
      editedAt: null,
      deletedAt: null,
    },
    {
      splitId: splitOpen.id,
      userId,
      content: "Split created: Dinner with Friends — $85.50 total",
      isSystemMessage: true,
      createdAt: daysAgo(3),
      editedAt: null,
      deletedAt: null,
    },
    {
      splitId: splitOpen.id,
      userId,
      content: "Sarah, please send your share when you can!",
      isSystemMessage: false,
      createdAt: daysAgo(1),
      editedAt: null,
      deletedAt: null,
    },
    {
      splitId: splitSettled.id,
      userId,
      content: "Airport ride settled — thanks Mike!",
      isSystemMessage: false,
      createdAt: daysAgo(5),
      editedAt: null,
      deletedAt: null,
    },
  ]);

  // 12. Insert vault
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
      createdAt: daysAgo(20),
    },
    {
      vaultId: vault.id,
      userId,
      amount: "250.00",
      notes: "Month 2 contribution",
      createdAt: daysAgo(5),
    },
  ]);

  // 13. Insert AI chat session + messages
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

  // 14. Insert notifications
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
      createdAt: daysAgo(14),
    },
    {
      userId,
      type: "info",
      title: "Sarah hasn't paid yet",
      body: "Your split 'Dinner with Friends' has 1 pending payment from Sarah.",
      category: "split",
      relatedType: "split",
      relatedId: splitOpen.id, // ← use the actual splitOpen.id
      actionUrl: `/dashboard/splits/${splitOpen.id}`,
      read: false,
      dismissed: false,
      createdAt: daysAgo(2),
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
      createdAt: daysAgo(5),
    },
    {
      userId,
      type: "info",
      title: "Budget alert",
      body: "You've used 85% of your dining budget for this month.",
      category: "budget",
      relatedType: "budget",
      read: false,
      dismissed: false,
      createdAt: daysAgo(1),
    },
  ]);

  // Replace the TWO separate chatSessions inserts with ONE:

  const [budgetChatSession] = await db
    .insert(chatSessions)
    .values({
      userId,
      title: "Help with monthly budget",
      topic: "budgeting",
      isActive: true,
    })
    .returning();

  if (budgetChatSession) {
    await db.insert(chatMessages).values([
      {
        sessionId: budgetChatSession.id,
        userId,
        role: "user",
        content: "How can I save more this month?",
      },
      {
        sessionId: budgetChatSession.id,
        userId,
        role: "assistant",
        content:
          "Based on your spending, your subscriptions total $25.98/month. " +
          "Reducing dining out by 20% could save another ~$30. " +
          "Together that's roughly $55 you could redirect to your Bali vault.",
        tokensUsed: 148,
      },
      {
        sessionId: budgetChatSession.id,
        userId,
        role: "user",
        content: "What about the anomaly you flagged?",
      },
      {
        sessionId: budgetChatSession.id,
        userId,
        role: "assistant",
        content:
          "The $150 Club XYZ transaction was 3x your usual entertainment spend for a single transaction. " +
          "I flagged it because it occurred at 2am and at a merchant you've never visited before. " +
          "Was this intentional?",
        tokensUsed: 96,
      },
    ]);
  }

  // Then the additional 3 sessions:
  const extraSessions = await db
    .insert(chatSessions)
    .values([
      {
        userId,
        title: "Spending overview for June",
        topic: "spending",
        contextType: "general",
        isActive: true,
      },
      {
        userId,
        title: "Chat about transaction: Starbucks",
        topic: "spending",
        contextType: "transaction",
        contextId: "txn-123",
        isActive: true,
      },
      {
        userId,
        title: "Budget check: Dining out",
        topic: "budgeting",
        contextType: "budget",
        contextId: "budget-456",
        isActive: true,
      },
    ])
    .returning();

  if (extraSessions.length > 0 && extraSessions[0]) {
    const firstSessionId = extraSessions[0].id;
    await db.insert(chatMessages).values([
      {
        sessionId: firstSessionId,
        userId,
        role: "user",
        content: "How much did I spend this month?",
      },
      {
        sessionId: firstSessionId,
        userId,
        role: "assistant",
        content:
          "You spent $2,340 this month. That's 15% more than last month. Your top categories are Dining ($450), Groceries ($380), and Transport ($210).",
        tokensUsed: 145,
      },
      {
        sessionId: firstSessionId,
        userId,
        role: "user",
        content: "Why is dining so high?",
      },
      {
        sessionId: firstSessionId,
        userId,
        role: "assistant",
        content:
          "Your dining spending is 40% higher than your 3-month average. You had 12 restaurant visits vs your usual 8. The biggest spike was on June 15th with $85 at The Steakhouse.",
        tokensUsed: 132,
      },
    ]);
  }

  // // Add usage record
  // await db.insert(aiUsage).values({
  //   userId,
  //   month: new Date().getMonth() + 1,
  //   year: new Date().getFullYear(),
  //   queryCount: 2,
  //   tokenCount: 277,
  // });

  console.log(`✅ Seeded AI chat sessions`);

  console.log("✅ Seeding complete!");
  console.log(`   User: ${existingUser.email}`);
  console.log(`   Accounts: 5 (checking, savings, credit, investment, crypto)`);
  console.log(`   Custom Categories: 2`);
  console.log(`   Transactions: ${transactionsData.length}`);
  console.log(`   Budgets: 14 categories`);
  console.log(`   Insights: 5`);
  console.log(`   Splits: 1 (1 open, Sarah pending)`);
  console.log(`   Vaults: 1 (Bali — 22% funded)`);
  console.log(`   Chat messages: 4`);
  console.log(`   Notifications: 4`);
  console.log(`   CSV Imports: 1`);
  console.log(`   Transaction Tags: 3`);
}

seed().catch(console.error);
