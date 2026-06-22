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
  disableFuture?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled,
  disableFuture = true,
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

  const getTodayAtMidnight = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={hasActive ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          className={cn(
            "gap-2 h-10 font-normal flex items-center",
            !hasActive && "text-muted-foreground ",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 mb-1" />
          <span className="flex-1 text-left">{label}</span>
          {hasActive && (
            <span
              role="button"
              aria-label="Clear date"
              className="ml-0.5 rounded-full hover:text-destructive transition-colors"
              onClick={handleClear}
            >
              <X className="size-4" />
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
          endMonth={
            toDate ?? (disableFuture ? getTodayAtMidnight() : undefined)
          }
          disabled={(() => {
            const matchers: Matcher[] = [];

            if (disableFuture) {
              matchers.push({ after: getTodayAtMidnight() });
            }

            if (fromDate) {
              matchers.push({ before: fromDate });
            }

            if (toDate) {
              matchers.push({ after: toDate });
            }

            return matchers.length > 0 ? matchers : undefined;
          })()}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
