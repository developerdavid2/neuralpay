"use client";

import { useState, useCallback } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@neuralpay/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@neuralpay/ui/components/popover";
import { Calendar } from "@neuralpay/ui/components/calendar";
import type { DateRange } from "react-day-picker";
import { cn } from "@neuralpay/ui/lib/utils";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Date Range",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(value);

  const hasActive = Boolean(value?.from);

  const handleOpen = useCallback(
    (next: boolean) => {
      if (next) setDraft(value); // reset draft to committed value when opening
      setOpen(next);
    },
    [value],
  );

  const handleApply = useCallback(() => {
    onChange(draft?.from ? draft : undefined);
    setOpen(false);
  }, [draft, onChange]);

  const handleClear = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setDraft(undefined);
      onChange(undefined);
      setOpen(false);
    },
    [onChange],
  );

  const label = value?.from
    ? value.to
      ? `${format(value.from, "MMM d")} – ${format(value.to, "MMM d")}`
      : format(value.from, "MMM d")
    : placeholder;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActive ? "default" : "outline"}
          size="sm"
          className={cn("gap-2 h-8", className)}
        >
          <CalendarIcon className="size-3.5" />
          {label}
          {hasActive && (
            <span
              role="button"
              aria-label="Clear date range"
              className="ml-0.5 rounded-full hover:text-destructive"
              onClick={handleClear}
            >
              <X className="size-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {/*
          numberOfMonths={2} lets react-day-picker manage both months
          as a single linked unit — left always shows previous, right shows next.
          No custom month state needed.
        */}
        <Calendar
          mode="range"
          selected={draft}
          onSelect={setDraft}
          numberOfMonths={2}
          defaultMonth={draft?.from ?? value?.from}
          disabled={{ after: new Date() }}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date()}
        />
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {draft?.from && (
              <Button variant="ghost" size="sm" onClick={() => handleClear()}>
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
