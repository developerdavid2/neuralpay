"use client";

import {
  BUDGET_CATEGORY,
  BUDGET_COLORS,
  BUDGET_PERIODS,
  type BudgetPeriod,
} from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import { Field, FieldError, FieldLabel } from "@neuralpay/ui/components/field";
import { Input } from "@neuralpay/ui/components/input";
import { Slider } from "@neuralpay/ui/components/slider";
import { Textarea } from "@neuralpay/ui/components/textarea";
import { cn } from "@neuralpay/ui/lib/utils";
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  Controller,
  type UseFormReturn,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { AmountInput } from "@/components/amount-input";
import { DatePicker } from "@/components/date-picker";
import { MultiSelectCombobox } from "@/components/multi-select-combobox";
import { useAllAccounts } from "@/modules/accounts/hooks/queries/use-all-accounts";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/modules/dashboard/constants";
import type { FormValues } from "../../types";

const PERIOD_LABELS: Record<BudgetPeriod, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  custom: "Custom range",
};

interface Props {
  form: UseFormReturn<FormValues>;
  disabled?: boolean;
}

export function BudgetFormFields({ form, disabled }: Props) {
  const pending = disabled || form.formState.isSubmitting;
  const { control, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories",
  });

  const categories = useWatch({ control, name: "categories" }) ?? [];
  const startDateValue = useWatch({ control, name: "startDate" });

  const total = useMemo(
    () =>
      Math.round(
        categories.reduce((sum, c) => sum + (Number(c.limitAmount) || 0), 0) *
          100,
      ) / 100,
    [categories],
  );

  useEffect(() => {
    const currentLimit = form.getValues("limitAmount");
    if (currentLimit !== total) {
      setValue("limitAmount", total, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [total, setValue, form]);

  const applyPeriod = (
    next: BudgetPeriod,
    onChange: (value: BudgetPeriod) => void,
  ) => {
    onChange(next);
    if (next === "custom") return;
    const now = new Date();
    if (next === "weekly") {
      setValue(
        "startDate",
        startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      );
      setValue("endDate", endOfWeek(now, { weekStartsOn: 1 }).toISOString());
    } else {
      setValue("startDate", startOfMonth(now).toISOString());
      setValue("endDate", endOfMonth(now).toISOString());
    }
  };

  const { accountsData: accounts } = useAllAccounts();
  const accountOptions = (accounts ?? []).map((a) => ({
    label: a.name ?? a.bankName ?? "Account",
    value: a.id,
    sublabel: a.bankName ?? undefined,
  }));

  const usedCategories = new Set(categories.map((c) => c.category));
  return (
    <div className="flex flex-col gap-6">
      {/* Name */}
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Budget Name *</FieldLabel>
            <Input
              {...field}
              placeholder="e.g. Groceries & Dining"
              disabled={pending}
              aria-invalid={fieldState.invalid}
              className="rounded-xl"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              {...field}
              value={field.value ?? ""}
              placeholder="What is this budget for?"
              rows={2}
              disabled={pending}
              aria-invalid={fieldState.invalid}
              className="rounded-xl"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="limitAmount"
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Total Budget Limit</FieldLabel>

            <Input
              type="text"
              readOnly
              tabIndex={-1}
              disabled={pending}
              value={total.toLocaleString(undefined, {
                style: "currency",
                currency: "USD",
              })}
              className="rounded-xl bg-muted/50 cursor-not-allowed font-medium"
            />

            <p className="text-xs text-muted-foreground">
              Automatically calculated as the sum of your category limits below.
            </p>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Categories repeater */}
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel>Categories *</FieldLabel>
          <span className="text-xs text-muted-foreground tabular-nums">
            Total:{" "}
            {total.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
            })}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const rowCategory = categories[index]?.category;
            const categoryOptions = BUDGET_CATEGORY.map((c) => {
              const Icon = CATEGORY_ICONS[c];
              return {
                label: CATEGORY_LABELS[c] ?? c,
                value: c,
                icon: Icon ? <Icon className="size-3.5" /> : undefined,
                disabled: usedCategories.has(c) && c !== rowCategory,
              };
            });

            return (
              <div
                key={field.id}
                className="flex items-start gap-2 rounded-xl border border-border p-2.5"
              >
                <Controller
                  name={`categories.${index}.category`}
                  control={control}
                  render={({ field: catField }) => (
                    <MultiSelectCombobox
                      options={categoryOptions}
                      value={catField.value ?? ""}
                      onChange={(value) => value && catField.onChange(value)}
                      placeholder="Category"
                      searchPlaceholder="Search categories..."
                      disabled={pending}
                      className="flex-1"
                    />
                  )}
                />
                <Controller
                  name={`categories.${index}.limitAmount`}
                  control={control}
                  render={({ field: amtField }) => (
                    <AmountInput
                      value={String(amtField.value ?? 0)}
                      onChange={(v) => amtField.onChange(v ? Number(v) : 0)}
                      disabled={pending}
                      placeholder="0.00"
                      type="credit"
                      showTypeIndicator={false}
                    />
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={pending || fields.length === 1}
                  onClick={() => remove(index)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || fields.length >= 10}
          onClick={() =>
            append({
              category: "" as NonNullable<
                FormValues["categories"]
              >[number]["category"],
              limitAmount: 0,
            })
          }
          className="mt-3 gap-1.5 w-fit"
        >
          <Plus className="size-3.5" />
          Add category
        </Button>

        {form.formState.errors.categories?.message && (
          <FieldError
            errors={[{ message: form.formState.errors.categories.message }]}
          />
        )}
      </Field>

      {/* Period */}
      <Controller
        name="period"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Period *</FieldLabel>
            <div className="flex gap-1.5">
              {BUDGET_PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={pending}
                  onClick={() => applyPeriod(p, field.onChange)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                    "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
                    field.value === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent",
                  )}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>

            {field.value === "custom" && (
              <div className="grid grid-cols-2 gap-3 pt-3">
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field: startField, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs">Start date</FieldLabel>
                      <DatePicker
                        value={
                          startField.value
                            ? new Date(startField.value)
                            : undefined
                        }
                        onChange={(date) =>
                          date && startField.onChange(date.toISOString())
                        }
                        disabled={pending}
                        disableFuture={false}
                        placeholder="Start date"
                        className="w-full rounded-xl"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field: endField, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs">End date</FieldLabel>
                      <DatePicker
                        value={
                          endField.value ? new Date(endField.value) : undefined
                        }
                        onChange={(date) =>
                          date && endField.onChange(date.toISOString())
                        }
                        disabled={pending}
                        disableFuture={false}
                        fromDate={
                          startDateValue ? new Date(startDateValue) : undefined
                        }
                        placeholder="End date"
                        className="w-full rounded-xl"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            )}
          </Field>
        )}
      />

      {/* Alert threshold */}
      <Controller
        name="alertThreshold"
        control={control}
        render={({ field, fieldState }) => {
          const value = field.value ?? 80;
          return (
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Alert Threshold</FieldLabel>
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {value}%
                </span>
              </div>
              <Slider
                min={1}
                max={100}
                step={1}
                value={[value]}
                onValueChange={(vals) => field.onChange(vals[0])}
                disabled={pending}
                aria-invalid={fieldState.invalid}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Get notified when spending reaches {value}% of the limit.
              </p>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          );
        }}
      />

      {/* Color */}
      <Controller
        name="color"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Color</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {BUDGET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={pending}
                  onClick={() => field.onChange(c)}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform  disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
                    field.value === c
                      ? "border-foreground scale-110"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Choose color ${c}`}
                />
              ))}
            </div>
          </Field>
        )}
      />

      {/* Accounts */}
      <Controller
        name="accountIds"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Tracking Accounts</FieldLabel>
            <MultiSelectCombobox
              multiple
              options={accountOptions}
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="All accounts (leave empty to track all)"
              searchPlaceholder="Search accounts..."
              disabled={pending}
              className={cn(pending && "disabled:opacity-50")}
            />
          </Field>
        )}
      />
    </div>
  );
}
