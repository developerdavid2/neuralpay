"use client";

import { useState } from "react";
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
  icon?: React.ReactNode;
  triggerLabel?: React.ReactNode;
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
  contentClassName?: string;
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
  contentClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover
      open={open}
      onOpenChange={disabled ? undefined : setOpen}
      modal={true}
    >
      <PopoverTrigger asChild>
        <Button
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
          <span className="flex items-center gap-2 truncate">
            {selected?.icon}
            <span className="truncate">
              {selected
                ? (selected.triggerLabel ?? selected.label)
                : placeholder}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          // never narrower than the trigger, but free to grow with content
          "min-w-(--radix-popover-trigger-width) w-max max-w-[min(24rem,90vw)] p-0",
          contentClassName,
        )}
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  className={cn(
                    "capitalize hover:bg-accent",
                    opt.disabled &&
                      "opacity-40 cursor-not-allowed pointer-events-none",
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
                      "mr-2 size-4 shrink-0",
                      value === opt.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    {opt.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
