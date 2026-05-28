"use client";

import { AmountInput } from "@/components/amount-input";
import { DatePicker } from "@/components/date-picker";
import { TRANSACTION_CATEGORY } from "@neuralpay/types";
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
import type { FormValues } from "../../types";

interface Props {
  form: UseFormReturn<FormValues>;
  disabled?: boolean;
  bankAccountOptions: { label: string; value: string }[];
}

export function TransactionFormFields({
  form,
  disabled,
  bankAccountOptions,
}: Props) {
  const pending = disabled || form.formState.isSubmitting;

  return (
    <FieldGroup className="gap-4">
      {/* Bank Account */}
      <Controller
        name="bankAccountId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Bank Account *</FieldLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccountOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Description *</FieldLabel>
            <Input
              {...field}
              placeholder="What was this for?"
              disabled={pending}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Amount + Type */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Amount *</FieldLabel>
              <AmountInput
                value={String(field.value)}
                onChange={(v) => field.onChange(v ? Number(v) : 0)}
                disabled={pending}
                placeholder="0.00"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Type</FieldLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={pending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>

      {/* Date */}
      <Controller
        name="date"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Date</FieldLabel>
            <DatePicker
              value={field.value}
              onChange={(date) => date && field.onChange(date)}
              disabled={pending}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Category */}
      <Controller
        name="category"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              value={field.value ?? ""}
              onValueChange={(v) => field.onChange(v || undefined)}
              disabled={pending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_CATEGORY.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      {/* Merchant */}
      <Controller
        name="merchant"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Merchant (optional)</FieldLabel>
            <Input
              {...field}
              placeholder="e.g. Amazon"
              disabled={pending}
              value={field.value ?? ""}
            />
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
              placeholder="Additional details..."
              disabled={pending}
              value={field.value ?? ""}
            />
          </Field>
        )}
      />
    </FieldGroup>
  );
}
