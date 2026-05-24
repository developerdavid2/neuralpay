import { db } from "./src";
import { chatMessages, chatSessions, insights } from "./src/schema/ai";
import { notifications } from "./src/schema/notifications";
import {
  splitChatMessages,
  splitParticipants,
  splits,
} from "./src/schema/splits";
import { bankAccounts, budgets, transactions } from "./src/schema/transactions";
import { vaultContributions, vaultMembers, vaults } from "./src/schema/vaults";

// ─── Helper ───────────────────────────────────────────────────────────────────
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function randomAmount(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(2);
}

const CATEGORIES = [
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
      "Netflix (event)",
      "Spotify (event)",
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
  await db.delete(insights);
  await db.delete(budgets);
  await db.delete(transactions);
  await db.delete(bankAccounts);

  // 3. Insert accounts (exactly 3, matching original structure)
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

  // 4. Insert budgets (NEW — added to original)
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await db.insert(budgets).values([
    {
      userId,
      category: "food_dining",
      limitAmount: "350.00",
      month: currentMonth,
      year: currentYear,
      alertThreshold: 80,
      resetDay: 1,
    },
    {
      userId,
      category: "groceries",
      limitAmount: "500.00",
      month: currentMonth,
      year: currentYear,
      alertThreshold: 85,
      resetDay: 1,
    },
    {
      userId,
      category: "transport",
      limitAmount: "200.00",
      month: currentMonth,
      year: currentYear,
      alertThreshold: 75,
      resetDay: 1,
    },
    {
      userId,
      category: "subscriptions",
      limitAmount: "50.00",
      month: currentMonth,
      year: currentYear,
      alertThreshold: 90,
      resetDay: 1,
    },
    {
      userId,
      category: "shopping",
      limitAmount: "300.00",
      month: currentMonth,
      year: currentYear,
      alertThreshold: 80,
      resetDay: 1,
    },
    {
      userId,
      category: "entertainment",
      limitAmount: "150.00",
      month: currentMonth,
      year: currentYear,
      alertThreshold: 70,
      resetDay: 1,
    },
    {
      userId,
      category: "utilities",
      limitAmount: "250.00",
      month: currentMonth,
      year: currentYear,
      alertThreshold: 90,
      resetDay: 1,
    },
    {
      userId,
      category: "rent",
      limitAmount: "1200.00",
      month: currentMonth,
      year: currentYear,
      alertThreshold: 95,
      resetDay: 1,
    },
    {
      userId,
      category: "healthcare",
      limitAmount: "100.00",
      month: currentMonth,
      year: currentYear,
      alertThreshold: 80,
      resetDay: 1,
    },
  ]);

  // 5. Insert transactions — 90 days of generated data (expanded from original 10)
  const transactionsData: (typeof transactions.$inferInsert)[] = [];

  function getTransactionStatus(
    date: Date,
  ): "pending" | "successful" | "refunded" | "reversed" | "failed" {
    const now = Date.now();
    const ageMs = now - date.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    const roll = Math.random();

    // Recent 3 days: higher chance of pending (holds not yet settled)
    if (ageDays <= 3) {
      if (roll < 0.2) return "pending";
      if (roll < 0.25) return "failed";
      return "successful";
    }

    // Older than 3 days: pending is extremely rare (should have settled)
    if (roll < 0.02) return "failed"; // declined transfer / voided pre-auth
    if (roll < 0.06) return "refunded"; // merchant return
    if (roll < 0.09) return "reversed"; // bank undo / chargeback
    if (roll < 0.095) return "pending"; // edge case: long-running hold
    return "successful";
  }

  for (let day = 89; day >= 0; day--) {
    const date = daysAgo(day);
    const numTransactions = Math.floor(Math.random() * 3) + 1;

    for (let t = 0; t < numTransactions; t++) {
      const catInfo = weightedRandom(
        CATEGORIES.map((c) => ({ item: c, weight: c.weight })),
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
        status, // ← now distributed across all 5 statuses
        category: catInfo.category,
        merchant,
        date,
        isAnomaly,
        anomalyScore: isAnomaly ? (0.7 + Math.random() * 0.3).toFixed(2) : null,
      });
    }
  }

  // Add income transactions (salary every ~30 days)
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
    });
  }

  // Add freelance payment (successful, but one edge case)
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
  });

  await db.insert(transactions).values(transactionsData);

  // 6. Insert spending insights
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

  // 7. Insert split
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
      userId,
      shareAmount: "42.75",
      paid: true,
      paidAt: daysAgo(2),
    },
    {
      splitId: split1.id,
      userId: null,
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

  // 8. Insert vault
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

  // 9. Insert AI chat session + messages
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

  // 10. Insert notifications
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
      relatedId: split1.id,
      actionUrl: `/dashboard/splits/${split1.id}`,
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

  console.log("✅ Seeding complete!");
  console.log(`   User: ${existingUser.email}`);
  console.log(`   Accounts: 3 (checking, savings, credit)`);
  console.log(`   Transactions: ${transactionsData.length}`);
  console.log(`   Budgets: 9 categories`);
  console.log(`   Insights: 5`);
  console.log(`   Splits: 1 (1 open, Sarah pending)`);
  console.log(`   Vaults: 1 (Bali — 22% funded)`);
  console.log(`   Chat messages: 4`);
  console.log(`   Notifications: 4`);
}

seed().catch(console.error);
