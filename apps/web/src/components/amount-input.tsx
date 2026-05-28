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
};

export const AmountInput = ({
  value,
  onChange,
  disabled,
  placeholder,
  id,
}: Props) => {
  const parsedValue = parseFloat(value);
  const isIncome = parsedValue > 0; // type = credit
  const isExpense = parsedValue < 0; // type = debit (shouldn't happen but guard anyway)

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute left-1.5 top-1.5 rounded-md p-2 flex items-center justify-center",
                "bg-slate-400",
                isIncome && "bg-emerald-500",
                !isIncome &&
                  parsedValue !== 0 &&
                  !isNaN(parsedValue) &&
                  "bg-rose-500",
              )}
            >
              {!parsedValue || isNaN(parsedValue) ? (
                <Info className="size-3 text-white" />
              ) : isIncome ? (
                <PlusCircle className="size-3 text-white" />
              ) : (
                <MinusCircle className="size-3 text-white" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Amount is always positive — use the Type field to set debit or
            credit
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CurrencyInput
        id={id}
        prefix="$"
        className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
