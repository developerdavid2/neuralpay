import type {
  CreateTransactionInput,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
  UpdateTransactionInput,
} from "@neuralpay/types";

export type TransactionDrawerMode = "view" | "edit" | "add";

export type CreateFormValues = Omit<CreateTransactionInput, "isManual">;
export type UpdateFormValues = Omit<UpdateTransactionInput, "id">;
export type FormValues = CreateFormValues | UpdateFormValues;
