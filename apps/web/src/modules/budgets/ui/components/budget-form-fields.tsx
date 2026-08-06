import { AmountInput } from "@/components/amount-input";
import {
  CATEGORY_LABELS,
} from "@/modules/dashboard/constants";
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
import { Slider } from "@neuralpay/ui/components/slider";
import { cn } from "@neuralpay/ui/lib/utils";
import { Check } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  BUDGET_CATEGORY,
  BUDGET_COLORS,
  BUDGET_PERIODS,
} from "@neuralpay/types";
import { useTRPC } from "@/trpc/trpc-client";
import { useQuery } from "@tanstack/react-query";
import { rangeForPeriod } from "../../constants";
import type { BudgetFormValues } from "../../types";

interface Props {
  form: UseFormReturn<BudgetFormValues>;
  disabled?: boolean;
}

// Format an ISO datetime for a <input type="date"> (yyyy-MM-dd).
function toDateInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function BudgetFormFields({ form, disabled }: Props) {
  const pending = disabled || form.formState.isSubmitting;
  const trpc = useTRPC();
  const { data: accounts = [] } = useQuery(
    trpc.payments.accounts.listAll.queryOptions({}),
  );

  const period = form.watch("period");

  return (
    <FieldGroup className="gap-4">
      {/* Name */}
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Budget Name *</FieldLabel>
            <Input
              {...field}
              placeholder="e.g. Monthly Groceries"
              disabled={pending}
              aria-invalid={fieldState.invalid}
              className="rounded-xl"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Category */}
      <Controller
        name="category"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Category *</FieldLabel>
            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_CATEGORY.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c] ?? c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Limit */}
      <Controller
        name="limitAmount"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Budget Limit *</FieldLabel>
            <AmountInput
              value={String(field.value ?? "")}
              onChange={(v) => field.onChange(v ? Number(v) : 0)}
              disabled={pending}
              placeholder="0.00"
              type="debit"
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Period + dates */}
      <Controller
        name="period"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Period</FieldLabel>
            <Select
              value={field.value}
              onValueChange={(v) => {
                field.onChange(v);
                if (v !== "custom") {
                  const anchor = new Date(
                    form.getValues("startDate") || Date.now(),
                  );
                  const r = rangeForPeriod(v as BudgetFormValues["period"], anchor);
                  form.setValue("startDate", r.startDate, { shouldValidate: true });
                  form.setValue("endDate", r.endDate, { shouldValidate: true });
                }
              }}
              disabled={pending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_PERIODS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="startDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Start *</FieldLabel>
              <Input
                type="date"
                disabled={pending || period !== "custom"}
                value={toDateInput(field.value)}
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  )
                }
                className="rounded-xl"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="endDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>End *</FieldLabel>
              <Input
                type="date"
                disabled={pending || period !== "custom"}
                value={toDateInput(field.value)}
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  )
                }
                className="rounded-xl"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {/* Alert threshold */}
      <Controller
        name="alertThreshold"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>
              Alert at {field.value ?? 80}% of limit
            </FieldLabel>
            <Slider
              min={50}
              max={100}
              step={5}
              value={[field.value ?? 80]}
              onValueChange={(v) => field.onChange(v[0])}
              disabled={pending}
            />
          </Field>
        )}
      />

      {/* Color */}
      <Controller
        name="color"
        control={form.control}
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
                  style={{ backgroundColor: c }}
                  className={cn(
                    "size-7 rounded-full flex items-center justify-center transition ring-offset-2 ring-offset-background",
                    field.value === c && "ring-2 ring-foreground",
                  )}
                  aria-label={`Select color ${c}`}
                >
                  {field.value === c && (
                    <Check className="size-3.5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </Field>
        )}
      />

      {/* Accounts (optional scoping) */}
      <Controller
        name="accountIds"
        control={form.control}
        render={({ field }) => {
          const selected = field.value ?? [];
          const toggle = (id: string) =>
            field.onChange(
              selected.includes(id)
                ? selected.filter((x) => x !== id)
                : [...selected, id],
            );
          return (
            <Field>
              <FieldLabel>
                Accounts{" "}
                <span className="text-muted-foreground font-normal">
                  (all if none selected)
                </span>
              </FieldLabel>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto rounded-xl border p-2 scrollbar-thin">
                {accounts.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-1 py-2">
                    No accounts yet.
                  </p>
                ) : (
                  accounts.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      disabled={pending}
                      onClick={() => toggle(a.id)}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-accent",
                        selected.includes(a.id) && "bg-accent",
                      )}
                    >
                      <span className="truncate">
                        {a.name}
                        {a.bankName ? (
                          <span className="text-muted-foreground">
                            {" "}
                            · {a.bankName}
                          </span>
                        ) : null}
                      </span>
                      {selected.includes(a.id) && (
                        <Check className="size-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </Field>
          );
        }}
      />

      {/* Description */}
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Notes</FieldLabel>
            <Textarea
              {...field}
              value={field.value ?? ""}
              placeholder="Optional notes about this budget"
              disabled={pending}
              className="rounded-xl resize-none"
              rows={3}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
