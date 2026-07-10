"use client";

import { SearchableCombobox } from "@/components/searchable-combobox";
import { useCountries } from "../../hooks/queries/use-countries";
import { useStates } from "../../hooks/queries/use-states";

interface StateSelectProps {
  countryName?: string;
  value?: string;
  onChange: (stateName: string, isoCode: string) => void;
  disabled?: boolean;
}

export function StateSelect({
  countryName,
  value,
  onChange,
  disabled,
}: StateSelectProps) {
  const { data: countries } = useCountries();

  const countryIso = countries?.find((c) => c.label === countryName)?.value;

  const { data: states, isLoading } = useStates(countryIso);

  const options =
    states?.map((s) => ({ value: s.value, label: s.label })) ?? [];
  const selectedIso = states?.find((s) => s.label === value)?.value ?? "";

  const handleChange = (isoCode: string) => {
    const selected = states?.find((s) => s.value === isoCode);
    if (selected) onChange(selected.label, isoCode);
  };

  return (
    <SearchableCombobox
      options={options}
      value={selectedIso}
      onChange={handleChange}
      placeholder={countryIso ? "Select state..." : "Select country first"}
      searchPlaceholder="Search state..."
      disabled={disabled || !countryIso || isLoading}
      className="bg-input/50"
    />
  );
}
