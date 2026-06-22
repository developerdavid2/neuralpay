"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@neuralpay/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@neuralpay/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@neuralpay/ui/components/popover";
import { cn } from "@neuralpay/ui/lib/utils";

interface ComboboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Props {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  ariaInvalid?: boolean;
  className?: string;
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled,
  ariaInvalid,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  // ✅ FIX: Force focus to the input when popover opens
  // Bypass drawer's focus management by using a direct ref
  useEffect(() => {
    if (open) {
      // Small delay to let DOM settle
      const timer = setTimeout(() => {
        if (inputRef.current) {
          // Force focus directly on the input ref
          inputRef.current.focus();
          inputRef.current.click(); // Ensure it's activated
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [open]);

  // ✅ BACKUP: Also try to focus via cmdk selector if ref didn't work
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const input = document.querySelector(
          "[cmdk-input]",
        ) as HTMLInputElement;
        if (input && document.activeElement !== input) {
          input.focus();
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={disabled ? undefined : setOpen}
      modal={true}
    >
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            "w-full justify-between rounded-xl font-normal capitalize bg-secondary/50",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
        // ✅ Prevent popover from being closed by arrow keys while typing
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <Command
          shouldFilter={true}
          // ✅ Prevent command from stealing focus
          onKeyDown={(e) => {
            // Allow normal typing in input
            if (e.key !== "Tab") {
              e.stopPropagation();
            }
          }}
        >
          {/* ✅ Use ref to directly access and focus the input */}
          <CommandInput
            ref={inputRef}
            placeholder={searchPlaceholder}
            className="placeholder:text-muted-foreground"
            // ✅ Ensure input doesn't lose focus on any click
            onBlur={(e) => {
              // Re-focus if focus moves away
              setTimeout(() => {
                if (e.currentTarget && open) {
                  e.currentTarget.focus();
                }
              }, 0);
            }}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="overflow-visible">
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  className={cn(
                    "capitalize cursor-pointer",
                    opt.disabled && "opacity-50 cursor-not-allowed",
                  )}
                  disabled={opt.disabled}
                  onSelect={() => {
                    if (opt.disabled) return;
                    onChange(opt.value === value ? "" : opt.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === opt.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
