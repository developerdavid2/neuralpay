import {
  ACCOUNT_STATUSES,
  ACCOUNT_TYPES,
  type AccountStatus,
  type AccountType,
} from "@neuralpay/types";

export function validateAccountStatuses(
  raw?: string | string[],
): AccountStatus[] | undefined {
  if (!raw) return undefined;
  const arr = Array.isArray(raw) ? raw : raw.split(",").filter(Boolean);
  if (arr.length === 0 || arr[0] === "all") return undefined;
  const valid = arr.filter((s): s is AccountStatus =>
    ACCOUNT_STATUSES.includes(s as AccountStatus),
  );
  return valid.length > 0 ? valid : undefined;
}

export function validateAccountTypes(
  raw?: string | string[],
): AccountType[] | undefined {
  if (!raw) return undefined;
  const arr = Array.isArray(raw) ? raw : raw.split(",").filter(Boolean);
  if (arr.length === 0 || arr[0] === "all") return undefined;
  const valid = arr.filter((s): s is AccountType =>
    ACCOUNT_TYPES.includes(s as AccountType),
  );
  return valid.length > 0 ? valid : undefined;
}
