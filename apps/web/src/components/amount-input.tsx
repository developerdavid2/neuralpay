"use client";

import { useWatch } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@neuralpay/ui/components/tooltip";
import { cn } from "@neuralpay/ui/lib/utils";
import { Info, MinusCircle, PlusCircle } from "lucide-react";
import { CurrencyInput } from "react-currency-input-field";

type Props = {
  value: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  type?: "debit" | "credit";
  control?: any;
  name?: string;
};

export const AmountInput = ({
  value,
  onChange,
  disabled,
  placeholder,
  id,
  type: typeProp,
  control,
  name = "type",
}: Props) => {
  const watchedType = control ? useWatch({ control, name }) : undefined;
  const type = typeProp ?? watchedType ?? "debit";

  const parsedValue = parseFloat(value);
  const hasValue = !isNaN(parsedValue) && parsedValue !== 0;
  const isIncome = type === "credit";

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute left-1.5 top-1.5 rounded-md p-2 flex items-center justify-center transition-colors",
                !hasValue && "bg-slate-400",
                hasValue && isIncome && "bg-emerald-500",
                hasValue && !isIncome && "bg-destructive/70",
              )}
            >
              {!hasValue ? (
                <Info className="size-3 text-white" />
              ) : isIncome ? (
                <PlusCircle className="size-3 text-white" />
              ) : (
                <MinusCircle className="size-3 text-white" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isIncome
              ? "Income transaction — amount will be recorded as credit"
              : "Expense transaction — amount will be recorded as debit"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CurrencyInput
        id={id}
        prefix="$"
        className="pl-10 flex h-10 w-full rounded-xl border border-input bg-secondary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        decimalsLimit={2}
        decimalScale={2}
        disabled={disabled}
        allowNegativeValue={false}
      />
    </div>
  );
};
