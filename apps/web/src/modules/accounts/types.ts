import type { CreateAccountInput, UpdateAccountInput } from "@orra/types";
export type CreateFormValues = Omit<CreateAccountInput, "isManual">;
export type UpdateFormValues = Omit<UpdateAccountInput, "id">;
export type FormValues = CreateFormValues | UpdateFormValues;
