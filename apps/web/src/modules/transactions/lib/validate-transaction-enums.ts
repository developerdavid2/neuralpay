import {
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  TRANSACTION_CATEGORY,
  type TransactionStatus,
  type TransactionType,
  type TransactionCategory,
} from "@neuralpay/types";

const VALID_STATUSES = TRANSACTION_STATUS;
const VALID_TYPES = TRANSACTION_TYPE;
const VALID_CATEGORIES = TRANSACTION_CATEGORY;

export function validateTransactionStatuses(
  raw?: string | string[],
): TransactionStatus[] | undefined {
  if (!raw) return undefined;
  const arr = Array.isArray(raw) ? raw : raw.split(",").filter(Boolean);
  if (arr.length === 0 || arr[0] === "all") return undefined;
  const valid = arr.filter((s): s is TransactionStatus =>
    VALID_STATUSES.includes(s as TransactionStatus),
  );
  return valid.length > 0 ? valid : undefined;
}

export function validateTransactionTypes(
  raw?: string | string[],
): TransactionType[] | undefined {
  if (!raw) return undefined;
  const arr = Array.isArray(raw) ? raw : raw.split(",").filter(Boolean);
  if (arr.length === 0 || arr[0] === "all") return undefined;
  const valid = arr.filter((s): s is TransactionType =>
    VALID_TYPES.includes(s as TransactionType),
  );
  return valid.length > 0 ? valid : undefined;
}

export function validateTransactionCategories(
  raw?: string | string[],
): TransactionCategory[] | undefined {
  if (!raw) return undefined;
  const arr = Array.isArray(raw) ? raw : raw.split(",").filter(Boolean);
  const valid = arr.filter(
    (c): c is TransactionCategory =>
      VALID_CATEGORIES.includes(c as TransactionCategory) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c),
  );
  return valid.length > 0 ? valid : undefined;
}

export function validateAccountType(
  raw?: string,
): "checking" | "savings" | "credit" | "investment" | "crypto" | undefined {
  if (!raw || raw === "all") return undefined;
  const valid = [
    "checking",
    "savings",
    "credit",
    "investment",
    "crypto",
  ] as const;
  return valid.includes(raw as (typeof valid)[number])
    ? (raw as (typeof valid)[number])
    : undefined;
}
