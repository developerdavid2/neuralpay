"use client";

import { SearchableCombobox } from "@/components/searchable-combobox";
import { useCountries } from "../../hooks/queries/use-countries";

interface CountrySelectProps {
  value?: string;
  onChange: (countryName: string, isoCode: string, currency?: string) => void;
  disabled?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  disabled,
}: CountrySelectProps) {
  const { data: countries, isLoading } = useCountries();

  const options =
    countries?.map((c) => ({
      value: c.value,
      label: c.label,
      icon: (
        <img
          src={c.flagUrl}
          alt=""
          className="h-3.5 w-5 rounded-[2px] object-cover shrink-0"
          loading="lazy"
        />
      ),
    })) ?? [];

  const selectedIso = countries?.find((c) => c.label === value)?.value ?? "";

  const handleChange = (isoCode: string) => {
    const selected = countries?.find((c) => c.value === isoCode);
    if (selected) onChange(selected.label, isoCode, selected.currency);
  };

  return (
    <SearchableCombobox
      options={options}
      value={selectedIso}
      onChange={handleChange}
      placeholder="Select country..."
      searchPlaceholder="Search country..."
      disabled={disabled || isLoading}
      className="bg-input/50"
    />
  );
}
