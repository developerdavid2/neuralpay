import type { categoryEnum } from "@neuralpay/db";

type AppCategory = (typeof categoryEnum.enumValues)[number];

const DETAILED_TO_APP: Record<string, AppCategory> = {
  // Food & Dining
  FOOD_AND_DRINK_RESTAURANTS: "food_dining",
  FOOD_AND_DRINK_FAST_FOOD: "food_dining",
  FOOD_AND_DRINK_COFFEE: "food_dining",
  FOOD_AND_DRINK_BAR: "food_dining",
  FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK: "food_dining",

  // Groceries (split out from general food)
  FOOD_AND_DRINK_GROCERIES: "groceries",
  GENERAL_MERCHANDISE_SUPERSTORES: "groceries",

  // Transport
  TRANSPORTATION_GAS: "transport",
  TRANSPORTATION_TAXIS: "transport",
  TRANSPORTATION_PUBLIC_TRANSIT: "transport",
  TRANSPORTATION_PARKING: "transport",
  TRANSPORTATION_TOLLS: "transport",
  TRANSPORTATION_AUTOMOTIVE: "transport",
  TRANSPORTATION_OTHER_TRANSPORTATION: "transport",
  TRAVEL_FLIGHTS: "transport",
  TRAVEL_RENTAL_CARS: "transport",
  TRAVEL_LODGING: "transport",
  TRAVEL_OTHER_TRAVEL: "transport",

  // Shopping
  GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES: "shopping",
  GENERAL_MERCHANDISE_ELECTRONICS: "shopping",
  GENERAL_MERCHANDISE_SPORTING_GOODS: "shopping",
  GENERAL_MERCHANDISE_HOME_IMPROVEMENT: "shopping",
  GENERAL_MERCHANDISE_DISCOUNT_STORES: "shopping",
  GENERAL_MERCHANDISE_FURNITURE: "shopping",
  GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE: "shopping",

  // Entertainment
  ENTERTAINMENT_CASINOS_AND_GAMBLING: "entertainment",
  ENTERTAINMENT_MUSIC_AND_AUDIO: "entertainment",
  ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS: "entertainment",
  ENTERTAINMENT_TV_AND_MOVIES: "entertainment",
  ENTERTAINMENT_VIDEO_GAMES: "entertainment",
  ENTERTAINMENT_OTHER_ENTERTAINMENT: "entertainment",

  // Subscriptions
  GENERAL_SERVICES_SUBSCRIPTION: "subscriptions",

  // Healthcare
  MEDICAL_DOCTOR_VISIT: "healthcare",
  MEDICAL_PHARMACY: "healthcare",
  MEDICAL_INSURANCE: "healthcare",
  MEDICAL_DENTAL: "healthcare",
  MEDICAL_EYE_CARE: "healthcare",
  MEDICAL_VETERINARY: "healthcare",
  MEDICAL_OTHER_MEDICAL: "healthcare",

  // Education
  EDUCATION_TUITION: "education",
  EDUCATION_STUDENT_LOAN: "education",
  EDUCATION_BOOKS_AND_SUPPLIES: "education",
  EDUCATION_OTHER_EDUCATION: "education",

  // Utilities
  RENT_AND_UTILITIES_UTILITIES: "utilities",
  RENT_AND_UTILITIES_TELEPHONE: "utilities",
  RENT_AND_UTILITIES_INTERNET_AND_CABLE: "utilities",
  RENT_AND_UTILITIES_OTHER_UTILITIES: "utilities",

  // Rent
  RENT_AND_UTILITIES_RENT: "rent",

  // Income
  INCOME_WAGES: "income",
  INCOME_OTHER_INCOME: "income",
  INCOME_DIVIDENDS: "income",
  INCOME_INTEREST_EARNED: "income",
  INCOME_RETIREMENT_PENSION: "income",
  INCOME_TAX_REFUND: "income",
  INCOME_UNEMPLOYMENT: "income",

  // Investment
  TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS: "investment",
  TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS: "investment",

  // Transfer
  TRANSFER_IN_DEPOSIT: "transfer",
  TRANSFER_IN_CASH_ADVANCES_AND_LOANS: "transfer",
  TRANSFER_OUT_WITHDRAWAL: "transfer",
  TRANSFER_OUT_OTHER_TRANSFER_OUT: "transfer",
  TRANSFER_IN_OTHER_TRANSFER_IN: "transfer",
};

const PRIMARY_TO_APP: Record<string, AppCategory> = {
  FOOD_AND_DRINK: "food_dining",
  TRANSPORTATION: "transport",
  TRAVEL: "transport",
  GENERAL_MERCHANDISE: "shopping",
  ENTERTAINMENT: "entertainment",
  MEDICAL: "healthcare",
  EDUCATION: "education",
  RENT_AND_UTILITIES: "utilities",
  INCOME: "income",
  TRANSFER_IN: "transfer",
  TRANSFER_OUT: "transfer",
  LOAN_PAYMENTS: "other",
  BANK_FEES: "other",
  HOME_IMPROVEMENT: "shopping",
  PERSONAL_CARE: "other",
  GENERAL_SERVICES: "other",
  GOVERNMENT_AND_NON_PROFIT: "other",
};

export function mapPlaidCategoryToEnum(
  primary: string | null | undefined,
  detailed: string | null | undefined,
): AppCategory {
  if (detailed) {
    const hit = DETAILED_TO_APP[detailed];
    if (hit) return hit;
  }
  if (primary) {
    const hit = PRIMARY_TO_APP[primary];
    if (hit) return hit;
  }
  return "other";
}
