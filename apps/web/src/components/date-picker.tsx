"use client";

import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@neuralpay/ui/components/button";
import { Calendar } from "@neuralpay/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@neuralpay/ui/components/popover";
import { cn } from "@neuralpay/ui/lib/utils";
import type { Matcher } from "react-day-picker";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Disallow future dates. Defaults to false. */
  disableFuture?: boolean;
  /** Earliest selectable date */
  fromDate?: Date;
  /** Latest selectable date */
  toDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled,
  disableFuture = false,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const hasActive = Boolean(value);

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      onChange(date);
      setOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
    },
    [onChange],
  );

  const label = value ? format(value, "MMM d, yyyy") : placeholder;

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={hasActive ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          className={cn(
            "gap-2 h-8 font-normal justify-start",
            !hasActive && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0" />
          <span className="flex-1 text-left">{label}</span>
          {hasActive && (
            <span
              role="button"
              aria-label="Clear date"
              className="ml-0.5 rounded-full hover:text-destructive transition-colors"
              onClick={handleClear}
            >
              <X className="size-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          defaultMonth={value}
          captionLayout="dropdown"
          startMonth={fromDate ?? new Date(2020, 0)}
          endMonth={toDate ?? (disableFuture ? new Date() : undefined)}
          disabled={(() => {
            const matchers: Matcher[] = [];
            if (disableFuture) matchers.push({ after: new Date() });
            if (fromDate) matchers.push({ before: fromDate });
            if (toDate) matchers.push({ after: toDate });
            return matchers.length > 0 ? matchers : undefined;
          })()}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
