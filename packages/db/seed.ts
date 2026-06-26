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
import { eq } from "drizzle-orm";
import { INSIGHT_TYPES } from "../types/src";

// ═══════════════════════════════════════════════════════════════════════════════
//  CONFIGURATION — Scale your data here
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  USERS: 3, // Number of users
  MONTHS: 6, // Months of transaction history
  TX_PER_MONTH_MIN: 80, // Min transactions per user/month
  TX_PER_MONTH_MAX: 120, // Max transactions per user/month
  ACCOUNTS_PER_USER_MIN: 3, // Min bank accounts per user
  ACCOUNTS_PER_USER_MAX: 6, // Max bank accounts per user
  VAULTS_PER_USER: 2, // Savings vaults per user
  SPLITS_PER_USER: 4, // Bill splits per user
  CHAT_SESSIONS_PER_USER: 5, // AI chat sessions per user
  INSIGHTS_PER_USER: 8, // AI insights per user
  NOTIFICATIONS_PER_USER: 10, // Notifications per user
  BUDGET_CATEGORIES: 14, // All system categories
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  DATA POOLS — Realistic merchant & description pools
// ═══════════════════════════════════════════════════════════════════════════════

const MERCHANT_POOLS: Record<string, string[]> = {
  food_dining: [
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
    "Olive Garden",
    "Red Lobster",
    "Cheesecake Factory",
    "Wendy's",
    "KFC",
    "Subway",
    "Domino's",
    "Papa John's",
    "Buffalo Wild Wings",
    "Chick-fil-A",
    "In-N-Out Burger",
    "Whataburger",
    "Panda Express",
    "Dunkin' Donuts",
    "Krispy Kreme",
    "IHOP",
    "Denny's",
    "Waffle House",
    "Cracker Barrel",
    "Applebee's",
    "TGI Friday's",
    "Outback Steakhouse",
    "LongHorn Steakhouse",
    "Texas Roadhouse",
    "Ruth's Chris Steak House",
    "The Capital Grille",
    "Morton's",
    "Fleming's Prime Steakhouse",
    "Del Frisco's",
    "Peter Luger",
    "Smith & Wollensky",
    "Gibsons Bar & Steakhouse",
    "Nobu",
    "Masa",
    "Eleven Madison Park",
    "Per Se",
    "Le Bernardin",
    "Jean-Georges",
    "Daniel",
    "The French Laundry",
    "Alinea",
  ],
  groceries: [
    "Whole Foods",
    "Trader Joe's",
    "Kroger",
    "Safeway",
    "Costco",
    "Aldi",
    "Walmart",
    "Target Grocery",
    "Instacart",
    "Amazon Fresh",
    "Sprouts",
    "Publix",
    "H-E-B",
    "Wegmans",
    "ShopRite",
    "Stop & Shop",
    "Giant Eagle",
    "Meijer",
    "Hy-Vee",
    "WinCo Foods",
    "Food Lion",
    "Harris Teeter",
    "King Soopers",
    "Fred Meyer",
    "Ralphs",
    "Vons",
    "Albertsons",
    "Gelson's",
    "Bristol Farms",
    "Fairway Market",
    "Central Market",
    "New Seasons Market",
    "Natural Grocers",
    "Fresh Thyme",
  ],
  transport: [
    "Uber",
    "Lyft",
    "Shell",
    "Exxon",
    "BP",
    "City Transit",
    "Parking Garage",
    "Enterprise",
    "Hertz",
    "Avis",
    "Budget",
    "National Car Rental",
    "Turo",
    "Zipcar",
    "Getaround",
    "ChargePoint",
    "EVgo",
    "Tesla Supercharger",
    "Shell Recharge",
    "BP Pulse",
    "Marathon",
    "Chevron",
    "Texaco",
    "Valero",
    "Speedway",
    "Circle K",
    "7-Eleven Gas",
    "Wawa",
    "QuikTrip",
    "Sheetz",
    "Pilot Flying J",
    "Love's",
    "TA Petro",
    "Maverik",
    "Casey's",
    "Kwik Trip",
    "Racetrac",
    "RaceWay",
  ],
  subscriptions: [
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
    "Slack",
    "Zoom",
    "Adobe Creative Cloud",
    "Microsoft 365",
    "Google Workspace",
    "Dropbox",
    "Box",
    "iCloud",
    "OneDrive",
    "LastPass",
    "1Password",
    "Dashlane",
    "NordVPN",
    "ExpressVPN",
    "Surfshark",
    "Canva Pro",
    "LinkedIn Premium",
    "Coursera Plus",
    "MasterClass",
    "Skillshare",
    "Pluralsight",
    "Udemy",
    "Codecademy",
    "Datacamp",
    " Brilliant",
    "Calm",
    "Headspace",
    "Peloton App",
    "Strava",
    "MyFitnessPal",
    "Noom",
    "WeightWatchers",
    "Blue Apron",
    "HelloFresh",
    "Home Chef",
    "Sunbasket",
    "Purple Carrot",
    "Green Chef",
  ],
  shopping: [
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
    "Ulta Beauty",
    "Macy's",
    "Nordstrom",
    "Bloomingdale's",
    "Neiman Marcus",
    "Saks Fifth Avenue",
    "Coach",
    "Michael Kors",
    "Tiffany & Co.",
    "Cartier",
    "Rolex",
    "Gucci",
    "Louis Vuitton",
    "Prada",
    "Chanel",
    "Hermès",
    "Burberry",
    "Versace",
    "Dolce & Gabbana",
    "Balenciaga",
    "Off-White",
    "Supreme",
    "StockX",
    "GOAT",
    "Grailed",
    "Depop",
    "Poshmark",
    "ThredUp",
    "Rebag",
    "Fashionphile",
    "The RealReal",
    "Farfetch",
    "SSENSE",
    "Mr Porter",
    "Net-a-Porter",
    "Matchesfashion",
    "Mytheresa",
  ],
  entertainment: [
    "AMC Theaters",
    "Regal Cinemas",
    "Cinemark",
    "Alamo Drafthouse",
    "Concert Hall",
    "Bowling Alley",
    "Arcade",
    "Comedy Club",
    "Sports Bar",
    "Dave & Buster's",
    "Topgolf",
    "Escape Room",
    "Axe Throwing",
    "Karaoke Bar",
    "Rooftop Bar",
    "Wine Bar",
    "Brewery",
    "Distillery",
    "Comedy Cellar",
    "The Improv",
    "Madison Square Garden",
    "Barclays Center",
    "Staples Center",
    "Crypto.com Arena",
    "SoFi Stadium",
    "MetLife Stadium",
    "Yankee Stadium",
    "Fenway Park",
    "Wrigley Field",
    "Lambeau Field",
    "AT&T Stadium",
    "Mercedes-Benz Stadium",
    "Allegiant Stadium",
    "SoFi Stadium",
    "Toyota Center",
    "Madison Square Garden",
    "Radio City Music Hall",
    "Carnegie Hall",
    "Hollywood Bowl",
    "Red Rocks Amphitheatre",
    "The Fillmore",
    "House of Blues",
  ],
  utilities: [
    "City Power",
    "Water Works",
    "Gas Company",
    "Internet Provider",
    "Phone Company",
    "Trash Service",
    "Comcast",
    "AT&T",
    "Verizon",
    "T-Mobile",
    "Spectrum",
    "CenturyLink",
    "Cox Communications",
    "Frontier",
    "Windstream",
    "Consolidated Communications",
    "Google Fiber",
    "Fios",
    "Xfinity",
    "DirecTV",
    "Dish Network",
    "Sling TV",
    "YouTube TV",
    "Hulu + Live TV",
    "fuboTV",
    "PlayStation Vue",
    "Philo",
  ],
  rent: [
    "Landlord LLC",
    "Property Management",
    "Apartment Complex",
    "Rent Office",
    "Greystar",
    "AvalonBay Communities",
    "Equity Residential",
    "UDR",
    "Camden Property Trust",
    "MAA",
    "Essex Property Trust",
    "Aimco",
    "Invitation Homes",
    "American Homes 4 Rent",
    "Tricon Residential",
    "Starwood",
    "Blackstone",
    "Brookfield",
    "Related Companies",
    "Vornado Realty Trust",
    "Boston Properties",
    "SL Green Realty",
    "Alexandria Real Estate",
    "Prologis",
  ],
  healthcare: [
    "CVS Pharmacy",
    "Walgreens",
    "Doctor Office",
    "Dentist",
    "Gym Membership",
    "Therapy Session",
    "Physical Therapy",
    "Chiropractor",
    "Optometrist",
    "Dermatologist",
    "Urgent Care",
    "Hospital",
    "LabCorp",
    "Quest Diagnostics",
    "24 Hour Fitness",
    "LA Fitness",
    "Equinox",
    "Planet Fitness",
    "Crunch Fitness",
    "OrangeTheory",
    "SoulCycle",
    "Peloton",
    "ClassPass",
    "Mindbody",
    "YMCA",
    "Gold's Gym",
    "Anytime Fitness",
    "Lifetime Fitness",
    "Barry's Bootcamp",
    "Rumble Boxing",
    "Solidcore",
    "Row House",
    "StretchLab",
    "Drybar",
  ],
  education: [
    "Coursera",
    "Udemy",
    "University Bookstore",
    "LinkedIn Learning",
    "Skillshare",
    "Pluralsight",
    "Codecademy",
    "FreeCodeCamp",
    "LeetCode",
    "DataCamp",
    "Dataquest",
    "Khan Academy",
    "MIT OpenCourseWare",
    "Harvard Extension",
    "Stanford Online",
    "Berkeley Extension",
    "Georgia Tech OMSCS",
    "University of London",
    "University of Michigan",
    "edX",
    "FutureLearn",
    "OpenLearning",
    "Alison",
    "Saylor Academy",
    "OpenLearn",
    "Canvas Network",
    "MOOC.org",
    "NovoEd",
    "iversity",
    "OpenSAP",
    "OpenWHO",
    "W3Schools",
    "MDN Web Docs",
    "CSS-Tricks",
  ],
  investment: [
    "Robinhood",
    "Fidelity",
    "Vanguard",
    "Coinbase",
    "E*Trade",
    "Charles Schwab",
    "TD Ameritrade",
    "Merrill Edge",
    "Interactive Brokers",
    "Webull",
    "SoFi Invest",
    "Public",
    "Stash",
    "Acorns",
    "Betterment",
    "Wealthfront",
    "Personal Capital",
    "M1 Finance",
    "Ally Invest",
    "Firstrade",
    "TradeStation",
    "Lightspeed",
    " tastytrade",
    "Thinkorswim",
    "MetaTrader",
    "TradingView",
    "Bloomberg Terminal",
    "FactSet",
    "Refinitiv",
    "S&P Capital IQ",
    "Morningstar",
    "Seeking Alpha",
  ],
  transfer: [
    "Internal Transfer",
    "Zelle Payment",
    "Wire Transfer",
    "ACH Transfer",
    "Venmo",
    "PayPal",
    "Cash App",
    "Apple Pay",
    "Google Pay",
    "Samsung Pay",
    "Wise",
    "Remitly",
    "Western Union",
    "MoneyGram",
    "Xoom",
    "Payoneer",
    "Revolut",
    "N26",
    "Monzo",
    "Chime",
    "Varo",
    "Current",
    "Aspiration",
    "Dave",
    "Earnin",
    "Brigit",
    "MoneyLion",
    "Albert",
    "One Finance",
    "Qapital",
    "Digit",
    "Simple",
    "Moven",
    "Level Money",
  ],
  other: [
    "Miscellaneous",
    "Unknown Merchant",
    "Adjustments",
    "Fees",
    "Refunds",
    "Reimbursements",
    "Donations",
    "Charity",
    "Tips",
    "Gratuities",
    "Parking Ticket",
    "Toll Road",
    "Library Fine",
    "Late Fee",
    "Overdraft Fee",
    "ATM Fee",
    "Foreign Transaction Fee",
    "Annual Fee",
    "Monthly Fee",
    "Service Fee",
    "Processing Fee",
    "Convenience Fee",
    "Installation Fee",
    "Cancellation Fee",
  ],
  income: [
    "Employer Inc",
    "Freelance Client",
    "Consulting Project",
    "Side Hustle",
    "Dividend Payment",
    "Interest Income",
    "Rental Income",
    "Royalty Payment",
    "Commission",
    "Bonus",
    "Overtime Pay",
    "Severance",
    "Unemployment",
    "Social Security",
    "Pension",
    "401(k) Distribution",
    "IRA Distribution",
    "Stock Options",
    "RSU Vesting",
    "ESPP",
    "Tax Refund",
    "Insurance Claim",
    "Settlement",
    "Grant",
    "Scholarship",
    "Fellowship",
    "Stipend",
    "Gig Work",
    "Affiliate Income",
    "Ad Revenue",
    "Sponsorship",
    "Patreon",
    "OnlyFans",
  ],
};

const ACCOUNT_TEMPLATES = [
  {
    type: "checking" as const,
    names: [
      "Primary Checking",
      "Everyday Checking",
      "Main Checking",
      "Chase Checking",
      "Wells Fargo Checking",
      "Bank of America Checking",
      "Citi Checking",
      "Capital One Checking",
      "Ally Checking",
      "Marcus Checking",
      "SoFi Checking",
      "Chime Checking",
      "Varo Checking",
      "Current Checking",
      "Aspiration Checking",
    ],
    subtypes: ["Primary", "Everyday", "Personal", "Joint", "Business"],
    banks: [
      "Chase",
      "Wells Fargo",
      "Bank of America",
      "Citi",
      "Capital One",
      "Ally",
      "Marcus",
      "SoFi",
      "PNC",
      "US Bank",
      "Truist",
      "TD Bank",
      "HSBC",
      "Citizens",
      "Fifth Third",
    ],
  },
  {
    type: "savings" as const,
    names: [
      "High-Yield Savings",
      "Emergency Fund",
      "Vacation Fund",
      "House Down Payment",
      "Car Fund",
      "Wedding Fund",
      "Holiday Savings",
      "Tax Savings",
      "General Savings",
      "Goal-Based Savings",
    ],
    subtypes: ["High-Yield", "Emergency", "Goal-Based", "CD", "Money Market"],
    banks: [
      "Marcus",
      "Ally",
      "SoFi",
      "Capital One 360",
      "Discover",
      "Synchrony",
      "Barclays",
      "CIT Bank",
      "TAB Bank",
      "Bread Savings",
      "Bask Bank",
      "FNBO Direct",
      "Popular Direct",
      "MySavingsDirect",
      "E*Trade Savings",
    ],
  },
  {
    type: "credit" as const,
    names: [
      "Chase Sapphire",
      "Amex Gold",
      "Amex Platinum",
      "Citi Double Cash",
      "Discover It",
      "Capital One Venture",
      "Chase Freedom",
      "Amex Blue Cash",
      "Wells Fargo Active Cash",
      "Bank of America Customized Cash",
      "Citi Custom Cash",
      "US Bank Altitude",
      "PNC Cash Rewards",
      "TD Bank Double Up",
      "Truist Enjoy Cash",
    ],
    subtypes: [
      "Rewards",
      "Cash Back",
      "Travel",
      "Balance Transfer",
      "Student",
      "Secured",
    ],
    banks: [
      "Chase",
      "American Express",
      "Citi",
      "Discover",
      "Capital One",
      "Wells Fargo",
      "Bank of America",
      "US Bank",
      "PNC",
      "TD Bank",
      "Truist",
      "Barclays",
      "Synchrony",
      "Comenity",
      "Wells Fargo",
    ],
  },
  {
    type: "investment" as const,
    names: [
      "Brokerage",
      "401(k)",
      "IRA",
      "Roth IRA",
      "SEP IRA",
      "HSA",
      "529 Plan",
      "Taxable Brokerage",
      "Margin Account",
      "Options Account",
    ],
    subtypes: ["Taxable", "Retirement", "Education", "Health", "Margin"],
    banks: [
      "Fidelity",
      "Vanguard",
      "Charles Schwab",
      "E*Trade",
      "TD Ameritrade",
      "Merrill Edge",
      "Interactive Brokers",
      "Webull",
      "SoFi Invest",
      "Robinhood",
      "Ally Invest",
      "Firstrade",
      "TradeStation",
      "Tastytrade",
      "M1 Finance",
    ],
  },
  {
    type: "crypto" as const,
    names: [
      "Bitcoin Wallet",
      "Ethereum Wallet",
      "DeFi Wallet",
      "Hardware Wallet",
      "Exchange Wallet",
      "Staking Wallet",
      "NFT Wallet",
      "Multi-Asset Wallet",
      "Cold Storage",
      "Hot Wallet",
    ],
    subtypes: ["Bitcoin", "Ethereum", "DeFi", "Hardware", "Exchange"],
    banks: [
      "Coinbase",
      "Binance.US",
      "Kraken",
      "Gemini",
      "Crypto.com",
      "BlockFi",
      "Celsius",
      "Nexo",
      "YouHodler",
      "Ledger Live",
      "Trezor Suite",
      "MetaMask",
      "Trust Wallet",
      "Exodus",
      "Atomic Wallet",
    ],
  },
];

// ════════════════════════════════════════════════════════
function randomDateBetween(start: Date, end: Date): Date {
  const diff = end.getTime() - start.getTime();
  return new Date(start.getTime() + Math.random() * diff);
}

function randomAmount(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function weightedRandom<T>(items: { item: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let random = Math.random() * total;
  for (const { item, weight } of items) {
    random -= weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1]!.item;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateAccountNumber(): string {
  return Math.floor(1000 + Math.random() * 8999).toString();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function seed() {
  console.log("🌱 Starting massive seed operation...");
  const startTime = Date.now();

  // 1. Get or create users
  const existingUsers = await db.query.user.findMany({ limit: CONFIG.USERS });
  if (existingUsers.length === 0) {
    console.log("No users found. Please sign up first, then run seed.");
    process.exit(1);
  }
  const users = existingUsers.slice(0, CONFIG.USERS);
  console.log(`   Found ${users.length} user(s)`);

  // 2. Clean existing data in dependency order
  console.log("🧹 Cleaning existing data...");
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
  console.log("   Clean complete");

  let totalTransactions = 0;
  let totalAccounts = 0;
  let totalInsights = 0;
  let totalNotifications = 0;
  let totalSplits = 0;
  let totalVaults = 0;
  let totalChats = 0;

  for (const user of users) {
    console.log(`\n👤 Seeding for user: ${user.email}`);
    const userId = user.id;

    // ── 3. Bank Accounts ─────────────────────────────────────────────────────
    const numAccounts = Math.floor(
      Math.random() *
        (CONFIG.ACCOUNTS_PER_USER_MAX - CONFIG.ACCOUNTS_PER_USER_MIN + 1) +
        CONFIG.ACCOUNTS_PER_USER_MIN,
    );
    const userAccounts: (typeof bankAccounts.$inferInsert)[] = [];
    const usedTypes = new Set<string>();

    // Ensure at least one checking and one savings
    const checkingTemplate = ACCOUNT_TEMPLATES[0]!;
    userAccounts.push({
      userId,
      name: pickRandom(checkingTemplate.names),
      type: "checking",
      subtype: pickRandom(checkingTemplate.subtypes),
      tags: ["primary", "usa", "checking"],
      balance: randomAmount(500, 15000),
      currency: "USD",
      bankName: pickRandom(checkingTemplate.banks),
      maskedNumber: generateAccountNumber(),
      isManual: true,
      status: "active",
    });
    usedTypes.add("checking");
    totalAccounts++;

    const savingsTemplate = ACCOUNT_TEMPLATES[1]!;
    userAccounts.push({
      userId,
      name: pickRandom(savingsTemplate.names),
      type: "savings",
      subtype: pickRandom(savingsTemplate.subtypes),
      tags: ["savings", "usa", "emergency"],
      balance: randomAmount(1000, 50000),
      currency: "USD",
      bankName: pickRandom(savingsTemplate.banks),
      maskedNumber: generateAccountNumber(),
      isManual: true,
      status: "active",
    });
    usedTypes.add("savings");
    totalAccounts++;

    // Fill remaining slots with random types
    for (let i = 2; i < numAccounts; i++) {
      const template = pickRandom(ACCOUNT_TEMPLATES);
      userAccounts.push({
        userId,
        name: pickRandom(template.names),
        type: template.type,
        subtype: pickRandom(template.subtypes),
        tags: [template.type, "usa"],
        balance:
          template.type === "credit"
            ? randomAmount(-8000, -100)
            : randomAmount(100, 75000),
        currency: "USD",
        bankName: pickRandom(template.banks),
        maskedNumber: generateAccountNumber(),
        isManual: Math.random() > 0.3,
        status: Math.random() > 0.9 ? "inactive" : "active",
      });
      totalAccounts++;
    }

    const insertedAccounts = await db
      .insert(bankAccounts)
      .values(userAccounts)
      .returning();
    const activeAccounts = insertedAccounts.filter(
      (a) => a.status === "active",
    );
    const checkingAcc = activeAccounts.find((a) => a.type === "checking");
    const creditAcc = activeAccounts.find((a) => a.type === "credit");
    const savingsAcc = activeAccounts.find((a) => a.type === "savings");
    const investmentAcc = activeAccounts.find((a) => a.type === "investment");
    const cryptoAcc = activeAccounts.find((a) => a.type === "crypto");

    console.log(`   Created ${insertedAccounts.length} accounts`);

    // ── 4. Budgets for all 14 categories ───────────────────────────────────────
    const now = new Date();
    const budgetValues = [];
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const budgetMonth = new Date(
        now.getFullYear(),
        now.getMonth() - monthOffset,
        1,
      );
      const month = budgetMonth.getMonth() + 1;
      const year = budgetMonth.getFullYear();

      budgetValues.push(
        ...Object.keys(MERCHANT_POOLS).map((cat) => ({
          userId,
          category: cat as any,
          limitAmount:
            cat === "rent"
              ? randomAmount(1000, 4000)
              : cat === "income"
                ? randomAmount(4000, 10000)
                : cat === "investment"
                  ? randomAmount(500, 3000)
                  : cat === "groceries"
                    ? randomAmount(300, 800)
                    : cat === "food_dining"
                      ? randomAmount(400, 1200)
                      : randomAmount(100, 600),
          month,
          year,
          alertThreshold: Math.floor(70 + Math.random() * 25),
          resetDay: 1,
        })),
      );
    }
    await db.insert(budgets).values(budgetValues);
    console.log(`   Created ${budgetValues.length} budgets`);

    // ── 5. CSV Imports ───────────────────────────────────────────────────────
    const csvImportsData = [];
    for (let i = 0; i < 3; i++) {
      csvImportsData.push({
        userId,
        bankAccountId: checkingAcc?.id ?? activeAccounts[0]!.id,
        filename: `statement_${["q1", "q2", "q3"][i]}_2026.csv`,
        totalRows: Math.floor(50 + Math.random() * 200),
        importedRows: Math.floor(45 + Math.random() * 190),
        skippedRows: Math.floor(0 + Math.random() * 10),
        status: ["completed", "completed", "processing"][i] as any,
        columnMapping: JSON.stringify({
          date: 0,
          description: 1,
          amount: 2,
          type: 3,
        }),
      });
    }
    const insertedCsvs = await db
      .insert(csvImports)
      .values(csvImportsData)
      .returning();
    console.log(`   Created ${insertedCsvs.length} CSV imports`);

    // ── 6. Transaction Tags ──────────────────────────────────────────────────
    const tagColors = [
      "#2563EB",
      "#DB2777",
      "#059669",
      "#D97706",
      "#7C3AED",
      "#DC2626",
      "#0891B2",
      "#65A30D",
    ];
    const tagNames = [
      "Work",
      "Personal",
      "Tax-Deductible",
      "Reimbursable",
      "Family",
      "Vacation",
      "Emergency",
      "Investment",
    ];
    const tagsData = tagNames.map((name, i) => ({
      userId,
      name,
      color: tagColors[i],
    }));
    const insertedTags = await db
      .insert(transactionTags)
      .values(tagsData)
      .returning();
    console.log(`   Created ${insertedTags.length} tags`);

    // ── 7. MASSIVE TRANSACTION GENERATION ────────────────────────────────────
    console.log(`   Generating transactions...`);
    const transactionsData: (typeof transactions.$inferInsert)[] = [];
    const endDate = new Date();
    const startDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth() - CONFIG.MONTHS,
      1,
    );
    const totalDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Category config with weights
    const categoryConfig = [
      { key: "food_dining", weight: 22, min: 8, max: 120 },
      { key: "groceries", weight: 18, min: 30, max: 250 },
      { key: "transport", weight: 12, min: 5, max: 60 },
      { key: "subscriptions", weight: 8, min: 5, max: 35 },
      { key: "shopping", weight: 10, min: 15, max: 500 },
      { key: "entertainment", weight: 7, min: 15, max: 250 },
      { key: "utilities", weight: 5, min: 50, max: 350 },
      { key: "rent", weight: 4, min: 800, max: 4000 },
      { key: "healthcare", weight: 3, min: 20, max: 600 },
      { key: "education", weight: 2, min: 10, max: 1000 },
      { key: "investment", weight: 4, min: 100, max: 3000 },
      { key: "transfer", weight: 3, min: 20, max: 1500 },
      { key: "other", weight: 2, min: 5, max: 200 },
      { key: "income", weight: 0, min: 2000, max: 10000 }, // handled separately
    ];

    // Generate daily transactions
    for (let day = 0; day <= totalDays; day++) {
      const date = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Weekend = more entertainment/dining, less work-related
      const dailyCount = isWeekend
        ? Math.floor(Math.random() * 4) + 2 // 2-5 on weekends
        : Math.floor(Math.random() * 3) + 1; // 1-3 on weekdays

      for (let t = 0; t < dailyCount; t++) {
        const catInfo = weightedRandom(
          categoryConfig.map((c) => ({ item: c, weight: c.weight })),
        );
        const merchants = MERCHANT_POOLS[catInfo.key] ?? ["Unknown"];
        const merchant = pickRandom(merchants);
        const amount = randomAmount(catInfo.min, catInfo.max);

        // Determine status based on age
        const ageDays = Math.floor(
          (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
        );
        let status: string;
        const roll = Math.random();
        if (ageDays <= 2) {
          status =
            roll < 0.3 ? "pending" : roll < 0.35 ? "failed" : "successful";
        } else if (ageDays <= 7) {
          status =
            roll < 0.05 ? "failed" : roll < 0.1 ? "refunded" : "successful";
        } else {
          status =
            roll < 0.02
              ? "failed"
              : roll < 0.06
                ? "refunded"
                : roll < 0.09
                  ? "reversed"
                  : "successful";
        }

        // Anomaly detection: flag unusual amounts
        const isAnomaly =
          (catInfo.key === "entertainment" || catInfo.key === "shopping") &&
          parseFloat(amount) > catInfo.max * 0.8 &&
          Math.random() < 0.15;

        // Pick account based on category
        let accountId: string;
        if (catInfo.key === "investment" && investmentAcc)
          accountId = investmentAcc.id;
        else if (catInfo.key === "subscriptions" && creditAcc)
          accountId = creditAcc.id;
        else if (catInfo.key === "rent" && checkingAcc)
          accountId = checkingAcc.id;
        else accountId = pickRandom(activeAccounts).id;

        transactionsData.push({
          bankAccountId: accountId,
          userId,
          description: merchant,
          amount,
          type: "debit" as const,
          status: status as any,
          category: catInfo.key as any,
          merchant,
          date,
          isAnomaly,
          anomalyScore: isAnomaly
            ? (0.65 + Math.random() * 0.35).toFixed(4)
            : null,
          notes: Math.random() > 0.85 ? `Purchase at ${merchant}` : null,
          isManual: Math.random() > 0.85,
          plaidTxId:
            Math.random() > 0.7
              ? `plaid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
              : null,
          monoTxId:
            Math.random() > 0.8
              ? `mono_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
              : null,
          csvImportId:
            Math.random() > 0.95 ? pickRandom(insertedCsvs).id : null,
        });
      }
    }

    // Income: biweekly salary deposits
    const biweeklyDates = [];
    let currentDate = new Date(startDate);
    // Align to first Friday
    while (currentDate.getDay() !== 5)
      currentDate.setDate(currentDate.getDate() + 1);

    while (currentDate <= endDate) {
      biweeklyDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 14);
    }

    for (const date of biweeklyDates) {
      const status = Math.random() > 0.95 ? "pending" : "successful";
      transactionsData.push({
        bankAccountId: checkingAcc?.id ?? activeAccounts[0]!.id,
        userId,
        description: "Salary — Employer Inc",
        amount: randomAmount(3500, 8000),
        type: "credit" as const,
        status: status as any,
        category: "income" as any,
        merchant: "Employer Inc",
        date,
        isAnomaly: false,
        anomalyScore: null,
        notes: "Biweekly salary deposit",
        isManual: false,
        plaidTxId: `plaid_salary_${date.toISOString().slice(0, 10)}`,
        monoTxId: null,
        csvImportId: null,
      });
    }

    // Freelance / side income (random)
    for (let i = 0; i < CONFIG.MONTHS * 2; i++) {
      const date = randomDateBetween(startDate, endDate);
      transactionsData.push({
        bankAccountId: checkingAcc?.id ?? activeAccounts[0]!.id,
        userId,
        description: `Freelance Payment — Project ${i + 1}`,
        amount: randomAmount(200, 2500),
        type: "credit" as const,
        status: "successful" as any,
        category: "income" as any,
        merchant: "Upwork Client",
        date,
        isAnomaly: false,
        anomalyScore: null,
        notes: `Invoice #${2000 + i}`,
        isManual: false,
        plaidTxId: null,
        monoTxId: `mono_fl_${i}`,
        csvImportId: null,
      });
    }

    // Investment deposits (monthly)
    for (let i = 0; i < CONFIG.MONTHS; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1 + Math.floor(Math.random() * 5),
      );
      if (date > endDate) continue;
      transactionsData.push({
        bankAccountId: investmentAcc?.id ?? activeAccounts[0]!.id,
        userId,
        description: "Monthly Investment Deposit",
        amount: randomAmount(500, 2000),
        type: "credit" as const,
        status: "successful" as any,
        category: "investment" as any,
        merchant: "Fidelity",
        date,
        isAnomaly: false,
        anomalyScore: null,
        notes: "Auto-invest from checking",
        isManual: false,
        plaidTxId: null,
        monoTxId: null,
        csvImportId: null,
      });
    }

    // Insert in batches to avoid memory issues
    const BATCH_SIZE = 500;
    let insertedCount = 0;
    for (let i = 0; i < transactionsData.length; i += BATCH_SIZE) {
      const batch = transactionsData.slice(i, i + BATCH_SIZE);
      await db.insert(transactions).values(batch);
      insertedCount += batch.length;
    }
    totalTransactions += insertedCount;
    console.log(`   Inserted ${insertedCount.toLocaleString()} transactions`);

    // ── 8. Tag mappings ──────────────────────────────────────────────────────
    const allInsertedTxs = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .limit(1000);

    const tagMappings = [];
    for (const tx of allInsertedTxs.slice(0, 200)) {
      if (Math.random() > 0.7) {
        tagMappings.push({
          transactionId: tx.id,
          tagId: pickRandom(insertedTags).id,
        });
      }
    }
    if (tagMappings.length > 0) {
      await db.insert(transactionTagMapping).values(tagMappings);
    }
    console.log(`   Mapped ${tagMappings.length} tags to transactions`);

    // ── 9. Insights ──────────────────────────────────────────────────────────
    const insightTypes = [
      "anomaly",
      "opportunity",
      "trend",
      "saving",
      "warning",
    ] as const;
    const insightSeverities = ["low", "medium", "high", "critical"] as const;
    const insightCategories = Object.keys(MERCHANT_POOLS);

    const insightsData = [];
    for (let i = 0; i < CONFIG.INSIGHTS_PER_USER; i++) {
      const type = pickRandom(INSIGHT_TYPES);
      const severity =
        type === "anomaly"
          ? pickRandom(["medium", "high", "critical"])
          : type === "warning"
            ? pickRandom(["medium", "high"])
            : pickRandom(["low", "medium"]);

      insightsData.push({
        userId,
        type,
        title: [
          "Unusual spending detected",
          "Subscription audit recommended",
          "Grocery spend is on target",
          "Budget threshold approaching",
          "Savings opportunity detected",
          "Investment rebalance suggested",
          "Duplicate charge detected",
          "Merchant refund available",
        ][i % 8],
        description: `AI-generated insight #${i + 1} for ${user.email}. Based on your spending patterns, we noticed ${type === "anomaly" ? "unusual activity" : type === "opportunity" ? "a potential savings" : "a trend"} in your ${pickRandom(insightCategories)} category.`,
        severity,
        category: pickRandom(insightCategories),
        generatedAt: randomDateBetween(startDate, endDate),
        read: Math.random() > 0.5,
        dismissed: Math.random() > 0.85,
      });
    }
    await db.insert(insights).values(insightsData);
    totalInsights += insightsData.length;
    console.log(`   Created ${insightsData.length} insights`);

    // ── 10. Splits ────────────────────────────────────────────────────────────
    const splitStatuses = ["open", "settled", "cancelled", "disputed"] as const;
    const splitCategories = [
      "food_dining",
      "transport",
      "entertainment",
      "shopping",
      "utilities",
      "rent",
      "travel",
      "healthcare",
    ] as const;
    const guestNames = [
      "Sarah",
      "Mike",
      "Jessica",
      "David",
      "Emily",
      "Chris",
      "Alex",
      "Jordan",
      "Taylor",
      "Morgan",
      "Casey",
      "Riley",
      "Quinn",
      "Avery",
      "Peyton",
    ];

    const splitsData = [];
    for (let i = 0; i < CONFIG.SPLITS_PER_USER; i++) {
      const status = pickRandom(splitStatuses);
      const totalAmount = randomAmount(30, 500);
      const category = pickRandom(splitCategories);

      splitsData.push({
        creatorId: userId,
        title: [
          "Dinner with Friends",
          "Uber to Airport",
          "Concert Tickets",
          "Grocery Run",
          "Utility Bill",
          "Rent Split",
          "Netflix & Chill",
          "Birthday Gift",
          "Weekend Trip",
          "Brunch Squad",
          "Game Night",
          "Housewarming",
        ][i % 12],
        description: `Split for ${category} — ${pickRandom(MERCHANT_POOLS[category] ?? ["Unknown"])}`,
        totalAmount,
        currency: "USD",
        category,
        paidById: userId,
        status,
        settledAt:
          status === "settled" ? randomDateBetween(startDate, endDate) : null,
      });
    }
    const insertedSplits = await db
      .insert(splits)
      .values(splitsData)
      .returning();
    totalSplits += insertedSplits.length;
    console.log(`   Created ${insertedSplits.length} splits`);

    // Split participants
    for (const split of insertedSplits) {
      const numParticipants = Math.floor(Math.random() * 3) + 2; // 2-4 participants
      const shareAmount = (
        parseFloat(split.totalAmount) / numParticipants
      ).toFixed(2);
      const participants = [];

      // Creator always pays their share
      participants.push({
        splitId: split.id,
        userId,
        shareAmount,
        paid:
          split.status === "settled" ||
          (split.status === "open" && Math.random() > 0.3),
        paidAt:
          split.status === "settled"
            ? randomDateBetween(startDate, endDate)
            : null,
        notes: null,
      });

      // Guest participants
      for (let j = 1; j < numParticipants; j++) {
        participants.push({
          splitId: split.id,
          userId: null,
          guestName: pickRandom(guestNames),
          guestEmail: `${pickRandom(guestNames).toLowerCase()}${j}@example.com`,
          shareAmount,
          paid: split.status === "settled" ? true : Math.random() > 0.5,
          paidAt:
            split.status === "settled"
              ? randomDateBetween(startDate, endDate)
              : null,
          notes: null,
        });
      }
      await db.insert(splitParticipants).values(participants);

      // Chat messages for each split
      if (Math.random() > 0.3) {
        const messages = [
          {
            content: `Hey! I've created the split for ${split.title} 🍽️`,
            isSystemMessage: false,
          },
          {
            content: `Split created: ${split.title} — $${split.totalAmount} total`,
            isSystemMessage: true,
          },
          {
            content: "Please send your share when you can!",
            isSystemMessage: false,
          },
          { content: "Got it, sending now 💸", isSystemMessage: false },
          { content: "Payment received! ✅", isSystemMessage: true },
        ];
      }
    }

    // ── 11. Vaults ───────────────────────────────────────────────────────────
    const vaultNames = [
      "Trip to Bali",
      "New Car Fund",
      "House Down Payment",
      "Emergency Fund",
      "Wedding Fund",
      "Christmas Gifts",
      "Tech Upgrade",
      "Side Hustle Seed",
      "Investment Pool",
      "Rainy Day Fund",
    ];
    const vaultCategories = [
      "vacation",
      "vehicle",
      "housing",
      "emergency",
      "wedding",
      "holiday",
      "technology",
      "business",
      "investment",
      "general",
    ] as const;
    const vaultColors = [
      "#7C3AED",
      "#059669",
      "#DC2626",
      "#D97706",
      "#DB2777",
      "#2563EB",
      "#0891B2",
      "#65A30D",
      "#9333EA",
      "#EA580C",
    ];

    for (let i = 0; i < CONFIG.VAULTS_PER_USER; i++) {
      const targetAmount = randomAmount(1000, 20000);
      const currentAmount = randomAmount(100, parseFloat(targetAmount) * 0.6);

      if (!vaultNames.length) {
        return;
      }

      const [vault] = await db
        .insert(vaults)
        .values({
          userId,
          name: vaultNames[i % vaultNames.length],
          description: `Saving for ${vaultNames[i % vaultNames.length].toLowerCase()} — started ${startDate.toLocaleDateString()}`,
          targetAmount,
          currentAmount,
          currency: "USD",
          category: vaultCategories[i % vaultCategories.length],
          targetDate: new Date(now.getFullYear(), now.getMonth() + 6 + i, 1),
          color: vaultColors[i % vaultColors.length],
        })
        .returning();
      totalVaults++;

      if (vault) {
        await db
          .insert(vaultMembers)
          .values({ vaultId: vault.id, userId, role: "owner" });

        // Contributions
        const numContributions = Math.floor(Math.random() * 5) + 3;
        for (let j = 0; j < numContributions; j++) {
          await db.insert(vaultContributions).values({
            vaultId: vault.id,
            userId,
            amount: randomAmount(50, 500),
            notes: j === 0 ? "Initial deposit" : `Month ${j + 1} contribution`,
            createdAt: randomDateBetween(startDate, endDate),
          });
        }
      }
    }
    console.log(
      `   Created ${CONFIG.VAULTS_PER_USER} vaults with contributions`,
    );

    // ── 12. AI Chat Sessions ──────────────────────────────────────────────────
    const chatTopics = [
      "budgeting",
      "spending",
      "investing",
      "saving",
      "debt",
      "goals",
      "anomalies",
      "trends",
      "forecasting",
      "taxes",
    ] as const;
    const chatTitles = [
      "Help with monthly budget",
      "Spending overview analysis",
      "Investment strategy review",
      "Saving for a house",
      "Debt payoff plan",
      "Financial goals check-in",
      "Unusual transaction review",
      "Spending trend analysis",
      "6-month forecast",
      "Tax optimization tips",
      "Emergency fund planning",
      "Retirement calculator",
      "Side hustle income tracking",
      "Subscription audit",
      "Big purchase planning",
    ];

    for (let i = 0; i < CONFIG.CHAT_SESSIONS_PER_USER; i++) {
      const isActive = i < 2; // First 2 are active
      const [session] = await db
        .insert(chatSessions)
        .values({
          userId,
          title: chatTitles[i % chatTitles.length],
          topic: pickRandom(chatTopics),
          contextType:
            Math.random() > 0.5
              ? (["transaction", "budget", "insight", "general"][i % 4] as any)
              : null,
          contextId: Math.random() > 0.7 ? `ctx_${i}_${Date.now()}` : null,
          isActive,
        })
        .returning();
      totalChats++;

      if (session) {
        // 3-8 messages per session
        const numMessages = Math.floor(Math.random() * 6) + 3;
        const messages = [];
        const userQuestions = [
          "How much did I spend this month?",
          "Why is my dining so high?",
          "Can I afford a vacation?",
          "Should I invest more?",
          "What's my net worth?",
          "Am I on track for retirement?",
          "Why was this transaction flagged?",
          "How do I save more?",
          "What's my biggest expense category?",
          "Should I pay off debt or invest?",
        ];
        const assistantResponses = [
          "Based on your spending, you've spent $2,340 this month. That's 15% more than last month.",
          "Your dining spending is 40% higher than your 3-month average. You had 12 restaurant visits vs your usual 8.",
          "You could afford a $3,000 vacation if you reduce discretionary spending by 20% for 2 months.",
          "Given your risk profile, increasing your investment contribution by 10% would be optimal.",
          "Your current net worth is $45,230, up 8% from last quarter.",
          "At your current savings rate, you'll reach your retirement goal by age 62.",
          "This transaction was flagged because it occurred at 2am and is 3x your typical amount at this merchant.",
          "You could save $340/month by: canceling 2 subscriptions ($45), reducing dining out ($180), and switching to a cheaper gym ($115).",
          "Your biggest expense is housing at 32% of income, followed by food at 18%.",
          "Mathematically, paying off your 19% APR credit card first yields a better return than investing.",
        ];

        for (let j = 0; j < numMessages; j++) {
          const isUser = j % 2 === 0;
          messages.push({
            sessionId: session.id,
            userId: isUser ? userId : null,
            role: isUser ? "user" : "assistant",
            content: isUser
              ? pickRandom(userQuestions)
              : (assistantResponses[j / 2] ?? pickRandom(assistantResponses)),
            tokensUsed: isUser ? null : Math.floor(80 + Math.random() * 120),
          });
        }
        await db.insert(chatMessages).values(messages);
      }
    }
    console.log(`   Created ${CONFIG.CHAT_SESSIONS_PER_USER} chat sessions`);

    // ── 13. Notifications ──────────────────────────────────────────────────────
    const notifTypes = [
      "info",
      "warning",
      "success",
      "alert",
      "reminder",
    ] as const;
    const notifCategories = [
      "transaction",
      "split",
      "vault",
      "budget",
      "insight",
      "account",
      "system",
      "security",
    ] as const;

    const notificationsData = [];
    for (let i = 0; i < CONFIG.NOTIFICATIONS_PER_USER; i++) {
      const type = pickRandom(notifTypes);
      const category = pickRandom(notifCategories);

      notificationsData.push({
        userId,
        type,
        title: [
          "Unusual transaction detected",
          "Payment received",
          "Budget alert",
          "Vault milestone reached",
          "Split payment pending",
          "Investment update",
          "Security alert",
          "Goal achieved",
          "Subscription renewing",
          "Low balance warning",
        ][i % 10],
        body: `Notification ${i + 1}: ${type} in ${category} category for user ${user.email.slice(0, 5)}...`,
        category,
        relatedType: category,
        relatedId: Math.random() > 0.5 ? `rel_${i}_${Date.now()}` : null,
        actionUrl: Math.random() > 0.5 ? `/dashboard/${category}s` : null,
        read: Math.random() > 0.6,
        dismissed: Math.random() > 0.9,
        createdAt: randomDateBetween(startDate, endDate),
      });
    }
    await db.insert(notifications).values(notificationsData);
    totalNotifications += notificationsData.length;
    console.log(`   Created ${notificationsData.length} notifications`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ SEEDING COMPLETE in ${elapsed}s`);
  console.log(
    `═══════════════════════════════════════════════════════════════`,
  );
  console.log(`   Users:              ${users.length}`);
  console.log(`   Total Accounts:     ${totalAccounts}`);
  console.log(`   Total Transactions: ${totalTransactions.toLocaleString()}`);
  console.log(
    `   Total Budgets:      ${users.length * CONFIG.BUDGET_CATEGORIES * 3}`,
  );
  console.log(`   Total Insights:     ${totalInsights}`);
  console.log(`   Total Splits:       ${totalSplits}`);
  console.log(`   Total Vaults:       ${totalVaults}`);
  console.log(`   Total Chat Sessions:${totalChats}`);
  console.log(`   Total Notifications:${totalNotifications}`);
  console.log(
    `═══════════════════════════════════════════════════════════════`,
  );
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
