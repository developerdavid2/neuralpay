// packages/db/src/seed/budget-seed.ts
import { eq } from "drizzle-orm";
import {
	bankAccounts,
	budgetAccounts,
	budgetCategories,
	budgets,
	db,
	user,
} from "./src";

// ── Helpers
function randomAmount(min: number, max: number): string {
	return (Math.random() * (max - min) + min).toFixed(2);
}

function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomDate(start: Date, end: Date): Date {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Category pools with realistic merchants
const CATEGORY_CONFIG: Record<
	string,
	{ merchants: string[]; typicalMin: number; typicalMax: number }
> = {
	food_dining: {
		merchants: [
			"Starbucks",
			"Chipotle",
			"McDonald's",
			"Local Bistro",
			"Sushi Place",
			"Five Guys",
			"Olive Garden",
		],
		typicalMin: 8,
		typicalMax: 120,
	},
	groceries: {
		merchants: [
			"Whole Foods",
			"Trader Joe's",
			"Kroger",
			"Costco",
			"Aldi",
			"Instacart",
		],
		typicalMin: 30,
		typicalMax: 250,
	},
	transport: {
		merchants: [
			"Uber",
			"Lyft",
			"Shell",
			"Exxon",
			"City Transit",
			"Parking Garage",
		],
		typicalMin: 5,
		typicalMax: 60,
	},
	subscriptions: {
		merchants: [
			"Netflix",
			"Spotify",
			"Amazon Prime",
			"Disney+",
			"GitHub",
			"Figma",
			"Notion",
		],
		typicalMin: 5,
		typicalMax: 35,
	},
	shopping: {
		merchants: [
			"Amazon",
			"Target",
			"Best Buy",
			"Nike",
			"Zara",
			"Etsy",
			"Apple Store",
		],
		typicalMin: 15,
		typicalMax: 500,
	},
	entertainment: {
		merchants: [
			"AMC Theaters",
			"Concert Hall",
			"Bowling Alley",
			"Dave & Buster's",
			"Topgolf",
		],
		typicalMin: 15,
		typicalMax: 250,
	},
	utilities: {
		merchants: ["City Power", "Water Works", "Comcast", "AT&T", "Verizon"],
		typicalMin: 50,
		typicalMax: 350,
	},
	rent: {
		merchants: [
			"Landlord LLC",
			"Property Management",
			"Apartment Complex",
			"Greystar",
		],
		typicalMin: 800,
		typicalMax: 4000,
	},
	healthcare: {
		merchants: [
			"CVS Pharmacy",
			"Doctor Office",
			"Gym Membership",
			"24 Hour Fitness",
			"Equinox",
		],
		typicalMin: 20,
		typicalMax: 600,
	},
	education: {
		merchants: [
			"Coursera",
			"Udemy",
			"University Bookstore",
			"LinkedIn Learning",
			"Skillshare",
		],
		typicalMin: 10,
		typicalMax: 1000,
	},
	investment: {
		merchants: ["Robinhood", "Fidelity", "Vanguard", "Coinbase", "E*Trade"],
		typicalMin: 100,
		typicalMax: 3000,
	},
	transfer: {
		merchants: [
			"Zelle Payment",
			"Wire Transfer",
			"Venmo",
			"PayPal",
			"Cash App",
		],
		typicalMin: 20,
		typicalMax: 1500,
	},
	other: {
		merchants: [
			"Miscellaneous",
			"Unknown Merchant",
			"Parking Ticket",
			"ATM Fee",
		],
		typicalMin: 5,
		typicalMax: 200,
	},
	income: {
		merchants: [
			"Employer Inc",
			"Freelance Client",
			"Dividend Payment",
			"Rental Income",
		],
		typicalMin: 2000,
		typicalMax: 10000,
	},
};

const BUDGET_COLORS = [
	"#6366f1",
	"#8b5cf6",
	"#ec4899",
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#14b8a6",
	"#0ea5e9",
	"#64748b",
];

const BUDGET_NAMES = [
	"Monthly Essentials",
	"Food & Dining",
	"Transportation",
	"Entertainment",
	"Shopping Spree",
	"Health & Wellness",
	"Education Fund",
	"Investment Plan",
	"Travel Budget",
	"Tech Gadgets",
	"Home Improvement",
	"Gift Fund",
	"Emergency Buffer",
	"Side Hustle",
];

// ── Month configurations: which months to seed and how many budgets per month
// Dec 2025 through Aug 2026, with some months skipped for variety
const MONTH_CONFIGS = [
	{ year: 2025, month: 11, count: 4 }, // Dec
	{ year: 2025, month: 11, count: 3 }, // Dec (second batch)
	{ year: 2026, month: 0, count: 5 }, // Jan
	{ year: 2026, month: 1, count: 4 }, // Feb
	// Mar skipped
	{ year: 2026, month: 3, count: 6 }, // Apr
	{ year: 2026, month: 4, count: 5 }, // May
	// Jun skipped
	{ year: 2026, month: 6, count: 7 }, // Jul
	{ year: 2026, month: 6, count: 4 }, // Jul (second batch)
	{ year: 2026, month: 7, count: 8 }, // Aug (current month, more data)
	{ year: 2026, month: 7, count: 5 }, // Aug (second batch)
];

// ── Create a single budget for a specific month
async function createBudgetForMonth(
	userId: string,
	accountIds: string[],
	nameIdx: number,
	colorIdx: number,
	year: number,
	month: number,
): Promise<typeof budgets.$inferSelect | null> {
	const categories = Object.keys(CATEGORY_CONFIG);
	const period = pickRandom(["weekly", "monthly", "custom"] as const);
	const totalLimit = parseFloat(randomAmount(500, 5000));

	// Date range based on period, anchored to the target month
	let startDate: Date;
	let endDate: Date;

	if (period === "weekly") {
		// Pick a random week within the month
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(year, month + 1, 0);
		startDate = randomDate(
			monthStart,
			new Date(monthEnd.getTime() - 6 * 86400000),
		);
		endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + 6);
	} else if (period === "monthly") {
		startDate = new Date(year, month, 1);
		endDate = new Date(year, month + 1, 0);
	} else {
		// Custom: spans into next month(s)
		startDate = randomDate(
			new Date(year, month, 1),
			new Date(year, month + 1, 0),
		);
		endDate = new Date(startDate);
		endDate.setMonth(endDate.getMonth() + randomInt(1, 3));
	}

	// Pick 1-4 categories
	const numCategories = randomInt(1, 4);
	const budgetCategoriesList: string[] = [];
	while (budgetCategoriesList.length < numCategories) {
		const cat = pickRandom(categories);
		if (!budgetCategoriesList.includes(cat) && cat !== "income") {
			budgetCategoriesList.push(cat);
		}
	}

	// Distribute limit across categories
	let remainingLimit = totalLimit;
	const categoryAllocations = budgetCategoriesList.map((cat, idx) => {
		const isLast = idx === budgetCategoriesList.length - 1;
		const alloc = isLast
			? remainingLimit
			: parseFloat((remainingLimit * (0.2 + Math.random() * 0.5)).toFixed(2));
		remainingLimit = parseFloat((remainingLimit - alloc).toFixed(2));
		return { category: cat, limitAmount: alloc.toFixed(2) };
	});

	// Create budget
	const [budget] = await db
		.insert(budgets)
		.values({
			userId,
			name: BUDGET_NAMES[nameIdx % BUDGET_NAMES.length] ?? "Budget",
			description: `Budget for ${budgetCategoriesList.join(", ")} — ${period}`,
			color: BUDGET_COLORS[colorIdx % BUDGET_COLORS.length],
			limitAmount: totalLimit.toFixed(2),
			period,
			startDate,
			endDate,
			month: startDate.getMonth() + 1,
			year: startDate.getFullYear(),
			alertThreshold: randomInt(70, 95),
			isActive: Math.random() > 0.1, // 90% active
		})
		.returning();

	if (!budget) return null;

	// Insert category allocations
	await db.insert(budgetCategories).values(
		categoryAllocations.map((ca) => ({
			budgetId: budget.id,
			category: ca.category,
			limitAmount: ca.limitAmount,
		})),
	);

	// Link 1-3 random accounts
	const numAccounts = Math.min(randomInt(1, 3), accountIds.length);
	const shuffled = [...accountIds].sort(() => Math.random() - 0.5);
	const linkedAccounts = shuffled.slice(0, numAccounts);

	await db.insert(budgetAccounts).values(
		linkedAccounts.map((accId) => ({
			budgetId: budget.id,
			bankAccountId: accId,
		})),
	);

	return budget;
}

// ── Seed budgets for a user across multiple months
async function seedUserBudgets(userId: string, accountIds: string[]) {
	const createdBudgets = [];
	let nameIdx = 0;
	let colorIdx = 0;

	for (const config of MONTH_CONFIGS) {
		for (let i = 0; i < config.count; i++) {
			const budget = await createBudgetForMonth(
				userId,
				accountIds,
				nameIdx++,
				colorIdx++,
				config.year,
				config.month,
			);
			if (budget) createdBudgets.push(budget);
		}
	}

	return createdBudgets;
}

// ── Main seed function
async function seedBudgets() {
	console.log("🌱 Starting budget seed...");

	const users = await db.select().from(user).limit(3);
	if (users.length === 0) {
		console.log("No users found. Create users first.");
		process.exit(1);
	}

	// Clean existing budget data
	console.log("🧹 Cleaning existing budgets...");
	await db.delete(budgetAccounts);
	await db.delete(budgetCategories);
	await db.delete(budgets);

	let totalBudgets = 0;

	for (const u of users) {
		// Get user's bank accounts
		const accounts = await db
			.select({ id: bankAccounts.id })
			.from(bankAccounts)
			.where(eq(bankAccounts.userId, u.id));

		const accountIds = accounts.map((a) => a.id);
		if (accountIds.length === 0) {
			console.log(`   User ${u.id} has no accounts, skipping budgets`);
			continue;
		}

		console.log(`\n👤 Seeding budgets for user ${u.email}`);
		const userBudgets = await seedUserBudgets(u.id, accountIds);
		totalBudgets += userBudgets.length;

		// Log month distribution
		const monthCounts = new Map<string, number>();
		for (const b of userBudgets) {
			const key = `${b.year}-${String(b.month).padStart(2, "0")}`;
			monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
		}
		for (const [month, count] of monthCounts) {
			console.log(`   ${month}: ${count} budgets`);
		}
	}

	console.log(`\n✅ Budget seed complete`);
	console.log(
		`═══════════════════════════════════════════════════════════════`,
	);
	console.log(`   Users:         ${users.length}`);
	console.log(`   Total Budgets: ${totalBudgets}`);
	console.log(`   Month Range:   Dec 2025 — Aug 2026`);
	console.log(
		`═══════════════════════════════════════════════════════════════`,
	);
}

seedBudgets().catch((err) => {
	console.error("❌ Budget seed failed:", err);
	process.exit(1);
});
