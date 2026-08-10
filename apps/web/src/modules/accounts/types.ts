import type { CreateAccountInput, UpdateAccountInput } from "@neuralpay/types";
export type CreateFormValues = Omit<CreateAccountInput, "isManual">;
export type UpdateFormValues = Omit<UpdateAccountInput, "id">;
export type FormValues = CreateFormValues | UpdateFormValues;
