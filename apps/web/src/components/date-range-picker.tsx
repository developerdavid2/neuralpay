"use client";

import { useState, useCallback } from "react";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@neuralpay/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@neuralpay/ui/components/popover";
import { Calendar } from "@neuralpay/ui/components/calendar";
import type { DateRange } from "react-day-picker";
import { addMonths } from "date-fns";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Custom",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(value);
  const [leftMonth, setLeftMonth] = useState(value?.from ?? new Date());
  const [rightMonth, setRightMonth] = useState(
    value?.to ?? addMonths(new Date(), 1),
  );

  const hasActive = Boolean(value?.from);

  const handleOpen = useCallback(
    (next: boolean) => {
      if (next) setDraft(value);
      setOpen(next);
    },
    [value],
  );

  const handleApply = useCallback(() => {
    onChange(draft?.from ? draft : undefined);
    setOpen(false);
  }, [draft, onChange]);

  const handleClear = useCallback(() => {
    setDraft(undefined);
    onChange(undefined);
    setOpen(false);
  }, [onChange]);

  const handleSelect = useCallback((range: DateRange | undefined) => {
    setDraft(range);
    if (range?.from) setLeftMonth(range.from);
    if (range?.to) setRightMonth(range.to);
  }, []);

  const label = value?.from
    ? value.to
      ? `${value.from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} \u2013 ${value.to.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : value.from.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActive ? "default" : "outline"}
          size="sm"
          className="gap-2 h-8"
        >
          <CalendarIcon className="size-3.5" />
          {label}
          {hasActive && (
            <span
              role="button"
              aria-label="Clear date range"
              className="ml-0.5 rounded-full hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              <X className="size-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          {/* Left calendar — current or from month */}
          <Calendar
            mode="range"
            selected={draft}
            onSelect={handleSelect}
            month={leftMonth}
            onMonthChange={setLeftMonth}
            disabled={{ after: new Date() }}
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date()}
          />
          {/* Right calendar — next month or to month */}
          <Calendar
            mode="range"
            selected={draft}
            onSelect={handleSelect}
            month={rightMonth}
            onMonthChange={setRightMonth}
            disabled={{ after: new Date() }}
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date()}
          />
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {draft?.from && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            )}
            <Button size="sm" onClick={handleApply} disabled={!draft?.from}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
