"use client";

import { useState, useCallback, useEffect } from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format, startOfMonth } from "date-fns";

import { Button } from "@neuralpay/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@neuralpay/ui/components/popover";
import { cn } from "@neuralpay/ui/lib/utils";

interface MonthYearPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minYear?: number;
  maxYear?: number;
  earliestDate?: Date;
}

export function MonthYearPicker({
  value,
  onChange,
  minYear = 2020,
  maxYear,
  earliestDate,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value.getFullYear());

  useEffect(() => {
    setViewYear(value.getFullYear());
  }, [value]);

  const currentYear = new Date().getFullYear();
  const effectiveMaxYear = maxYear ?? currentYear;

  const canGoPrevYear = viewYear > minYear;
  const canGoNextYear = viewYear < effectiveMaxYear;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const handleYearChange = useCallback((year: number) => {
    setViewYear(year);
  }, []);

  const handleSelect = useCallback(
    (monthIndex: number) => {
      onChange(new Date(viewYear, monthIndex, 1));
      setOpen(false);
    },
    [viewYear, onChange],
  );

  const isMonthDisabled = (monthIndex: number) => {
    const target = new Date(viewYear, monthIndex, 1);
    const now = startOfMonth(new Date());
    if (target > now) return true;
    if (earliestDate) {
      const earliest = startOfMonth(earliestDate);
      if (target < earliest) return true;
    }
    return false;
  };

  const isMonthSelected = (monthIndex: number) => {
    return value.getFullYear() === viewYear && value.getMonth() === monthIndex;
  };

  // Generate year options (2000 to current)
  const yearOptions = Array.from(
    { length: effectiveMaxYear - minYear + 1 },
    (_, i) => effectiveMaxYear - i,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-7 text-xs font-medium hover:bg-accent"
        >
          <CalendarIcon className="size-3.5 text-muted-foreground" />
          {format(value, "MMMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="end">
        {/* Year navigator with dropdown */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={() => setViewYear((y) => y - 1)}
            className="p-1 rounded-md hover:bg-accent transition-colors disabled:opacity-30"
            disabled={!canGoPrevYear}
          >
            ←
          </button>

          {/* Year dropdown */}
          <div className="relative">
            <select
              value={viewYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="appearance-none bg-background text-sm font-semibold tabular-nums pr-6 pl-2 py-1 rounded-md hover:bg-accent cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 size-3 pointer-events-none text-muted-foreground" />
          </div>

          <button
            onClick={() => setViewYear((y) => y + 1)}
            className="p-1 rounded-md hover:bg-accent transition-colors disabled:opacity-30"
            disabled={!canGoNextYear}
          >
            →
          </button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-3 gap-1">
          {months.map((month, index) => {
            const disabled = isMonthDisabled(index);
            const selected = isMonthSelected(index);

            return (
              <button
                key={month}
                onClick={() => handleSelect(index)}
                disabled={disabled}
                className={cn(
                  "px-3 py-2 text-xs rounded-lg transition-colors font-medium",
                  selected && "bg-primary text-primary-foreground",
                  !selected &&
                    disabled &&
                    "text-muted-foreground opacity-40 cursor-not-allowed",
                  !selected && !disabled && "hover:bg-accent text-foreground",
                )}
              >
                {month}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
