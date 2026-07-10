"use client";

import { Input } from "@neuralpay/ui/components/input";
import { SearchableCombobox } from "@/components/searchable-combobox";
import { useCountries } from "../../hooks/queries/use-countries";

interface PhoneInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, placeholder }: PhoneInputProps) {
  const { data: countries, isLoading } = useCountries();

  const parsePhone = (phone: string) => {
    if (!phone) return { dialCode: "+234", number: "" };
    const sorted = [...(countries ?? [])].sort(
      (a, b) => b.phonecode.length - a.phonecode.length,
    );
    const match = sorted.find((c) => phone.startsWith(c.phonecode));
    return match
      ? {
          dialCode: match.phonecode,
          number: phone.slice(match.phonecode.length),
        }
      : { dialCode: "+234", number: phone };
  };

  const { dialCode, number } = parsePhone(value);

  const dialOptions =
    countries?.map((c) => ({
      value: c.phonecode,
      label: `${c.phonecode}  ${c.label}`,
      triggerLabel: c.phonecode,
      icon: (
        <img
          src={c.flagUrl}
          alt=""
          className="h-3.5 w-5 rounded-[2px] object-cover shrink-0"
          loading="lazy"
        />
      ),
    })) ?? [];

  const handleDialChange = (newDialCode: string) =>
    onChange(`${newDialCode}${number}`);
  const handleNumberChange = (newNumber: string) =>
    onChange(`${dialCode}${newNumber}`);

  return (
    <div className="flex rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-ring">
      <div className="shrink-0 border-r border-input w-[150px]">
        <SearchableCombobox
          options={dialOptions}
          value={dialCode}
          onChange={handleDialChange}
          placeholder="+234"
          searchPlaceholder="Search country or code..."
          disabled={isLoading}
          className="rounded-none border-0 bg-input/60 px-2"
        />
      </div>
      <Input
        type="tel"
        value={number}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder={placeholder ?? "Enter Phone Number"}
        className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
