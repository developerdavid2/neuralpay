"use client";

import { AmountInput } from "@/components/amount-input";
import { DatePicker } from "@/components/date-picker";
import { SearchableCombobox } from "@/components/searchable-combobox";
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
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from "../../constants";
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

  const categoryOptions = TRANSACTION_CATEGORY.map((cat) => ({
    label: cat.replace(/_/g, " "),
    value: cat,
  }));

  return (
    <FieldGroup className="gap-4">
      {/* Bank Account — base-ui Combobox */}
      <Controller
        name="bankAccountId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Bank Account *</FieldLabel>
            <SearchableCombobox
              options={bankAccountOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="Select account..."
              disabled={pending}
              ariaInvalid={fieldState.invalid}
            />
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
              className="rounded-xl"
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
                control={form.control}
                name="type"
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
                defaultValue={TRANSACTION_TYPES[0].label}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
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
              className="rounded-xl"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Status */}
      <Controller
        name="status"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={pending}
              defaultValue={TRANSACTION_STATUSES[0].value}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_STATUSES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      {/* Category */}
      <Controller
        name="category"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Category</FieldLabel>
            <SearchableCombobox
              options={categoryOptions}
              value={field.value ?? ""}
              onChange={(v) => field.onChange(v || undefined)}
              placeholder="Select category..."
              disabled={pending}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {/* Merchant */}
      <Controller
        name="merchant"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Merchant</FieldLabel>
            <Input
              {...field}
              placeholder="e.g. Amazon"
              disabled={pending}
              value={field.value ?? ""}
              className="rounded-xl"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
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
