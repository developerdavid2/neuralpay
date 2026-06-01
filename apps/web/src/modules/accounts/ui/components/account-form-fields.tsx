// modules/accounts/ui/account-form-fields.tsx
"use client";

import { AmountInput } from "@/components/amount-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@neuralpay/ui/components/field";
import { Input } from "@neuralpay/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { Textarea } from "@neuralpay/ui/components/textarea";
import { Controller, type UseFormReturn } from "react-hook-form";
import { ACCOUNT_STATUSES, ACCOUNT_TYPES } from "../constants";
import type { FormValues } from "../types";

interface Props {
  form: UseFormReturn<<FormValues>;
  disabled?: boolean;
}

export function AccountFormFields({ form, disabled }: Props) {
  const pending = disabled || form.formState.isSubmitting;

  return (
    <FieldGroup className="gap-4">
      {/* Account Name */}
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Account Name *</FieldLabel>
            <Input
              {...field}
              placeholder="e.g. Chase Checking"
              disabled={pending}
              aria-invalid={fieldState.invalid}
              className="rounded-xl"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Bank Name */}
      <Controller
        name="bankName"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Bank Name</FieldLabel>
            <Input
              {...field}
              placeholder="e.g. JPMorgan Chase"
              disabled={pending}
              value={field.value ?? ""}
              aria-invalid={fieldState.invalid}
              className="rounded-xl"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Type + Status */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Account Type *</FieldLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={pending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="status"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={pending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>

      {/* Account Number */}
      <Controller
        name="accountNumber"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Account Number</FieldLabel>
            <Input
              {...field}
              placeholder="•••• •••• •••• 1234"
              disabled={pending}
              value={field.value ?? ""}
              aria-invalid={fieldState.invalid}
              className="rounded-xl"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Balance */}
      <Controller
        name="balance"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Current Balance</FieldLabel>
            <AmountInput
              value={String(field.value ?? 0)}
              onChange={(v) => field.onChange(v ? Number(v) : 0)}
              disabled={pending}
              placeholder="0.00"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Currency */}
      <Controller
        name="currency"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Currency</FieldLabel>
            <Select
              value={field.value ?? "usd"}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD — US Dollar</SelectItem>
                <SelectItem value="eur">EUR — Euro</SelectItem>
                <SelectItem value="gbp">GBP — British Pound</SelectItem>
                <SelectItem value="cad">CAD — Canadian Dollar</SelectItem>
                <SelectItem value="ngn">NGN — Nigerian Naira</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      {/* Notes */}
      <Controller
        name="notes"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Notes (optional)</FieldLabel>
            <Textarea
              {...field}
              placeholder="Additional details about this account..."
              disabled={pending}
              value={field.value ?? ""}
            />
          </Field>
        )}
      />
    </FieldGroup>
  );
}