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
  const arr = Array.isArray(raw) ? raw : [raw];
  if (arr.length === 0 || arr[0] === "all") return undefined;
  return arr.filter((s): s is TransactionStatus =>
    VALID_STATUSES.includes(s as TransactionStatus),
  );
}

export function validateTransactionTypes(
  raw?: string,
): TransactionType | undefined {
  if (!raw || raw === "all") return undefined;
  return VALID_TYPES.includes(raw as TransactionType)
    ? (raw as TransactionType)
    : undefined;
}

export function validateTransactionCategories(
  raw?: string | string[],
): (TransactionCategory | string)[] | undefined {
  if (!raw) return undefined;
  const arr = Array.isArray(raw) ? raw : [raw];
  if (arr.length === 0 || arr[0] === "all") return undefined;
  return arr.filter((c) => {
    // Allow system categories OR custom category UUIDs
    return (
      VALID_CATEGORIES.includes(c as TransactionCategory) ||
      /^[0-9a-f-]{36}$/i.test(c)
    );
  });
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
