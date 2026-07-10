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
import type { FormValues } from "../../types";
import { ACCOUNT_TYPES } from "@neuralpay/types";

interface Props {
  form: UseFormReturn<FormValues>;
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

      {/* Type */}
      <div className="gap-4">
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
      </div>

      {/* Account Number */}
      <Controller
        name="maskedNumber"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Last 4 Account digits</FieldLabel>
            <Input
              {...field}
              placeholder="1234"
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
              type="credit"
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
              value={field.value ?? "USD"}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="GBP">GBP — British Pound</SelectItem>
                <SelectItem value="CAD">CAD — Canadian Dollar</SelectItem>
                <SelectItem value="NGN">NGN — Nigerian Naira</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      />
    </FieldGroup>
  );
}
