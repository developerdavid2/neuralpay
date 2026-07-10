"use client";

import { SearchableCombobox } from "@/components/searchable-combobox";
import { useCountries } from "../../hooks/queries/use-countries";
import { useStates } from "../../hooks/queries/use-states";
import { useCities } from "../../hooks/queries/use-cities";

interface CitySelectProps {
  countryName?: string;
  stateName?: string;
  value?: string;
  onChange: (cityName: string) => void;
  disabled?: boolean;
}

const normalize = (s: string) => s.trim().toLowerCase();

export function CitySelect({
  countryName,
  stateName,
  value,
  onChange,
  disabled,
}: CitySelectProps) {
  const { data: countries } = useCountries();
  const countryIso = countries?.find((c) => c.label === countryName)?.value;

  const { data: states } = useStates(countryIso);
  const stateIso = states?.find((s) => s.label === stateName)?.value;

  const { data: cities, isLoading } = useCities(countryIso, stateIso);

  const options =
    cities?.map((c) => ({ value: c.value, label: c.label })) ?? [];
  const matched = options.find(
    (o) => normalize(o.value) === normalize(value ?? ""),
  );
  const comboboxValue = matched?.value ?? value ?? "";

  return (
    <SearchableCombobox
      options={options}
      value={comboboxValue}
      onChange={onChange}
      placeholder={stateIso ? "Select city..." : "Select state first"}
      searchPlaceholder="Search city..."
      disabled={disabled || !stateIso || isLoading}
      className="bg-input/50"
    />
  );
}
