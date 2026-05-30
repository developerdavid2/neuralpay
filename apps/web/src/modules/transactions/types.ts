import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@neuralpay/types";
export type CreateFormValues = Omit<CreateTransactionInput, "isManual">;
export type UpdateFormValues = Omit<UpdateTransactionInput, "id">;
export type FormValues = CreateFormValues | UpdateFormValues;
