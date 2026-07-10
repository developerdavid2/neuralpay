import type { CityOption } from "@neuralpay/types";
import axios from "axios";
import { City } from "country-state-city";

type CountriesNowCitiesResponse = {
  error: boolean;
  msg: string;
  data: string[];
};

const COUNTRIESNOW_BASE_URL = "https://countriesnow.space/api/v0.1";

export const dedupeCities = (cities: string[]): CityOption[] => {
  const seen = new Set<string>();
  const result: CityOption[] = [];

  for (const raw of cities) {
    const trimmed = raw.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    result.push({ value: trimmed, label: trimmed });
  }

  // stable alphabetical order — nicer for a combobox than API insertion order
  return result.sort((a, b) => a.label.localeCompare(b.label));
};

// countriesnow.space is picky about "Lagos" vs "Lagos State" depending on country,
// so we try a couple of reasonable variants before giving up on that source
const buildStateNameCandidates = (stateName: string): string[] => {
  const base = stateName.trim();
  if (!base) return [];

  const candidates = new Set<string>([base]);
  const withoutSuffix = base.replace(/\s+state$/i, "").trim();
  if (withoutSuffix) candidates.add(withoutSuffix);
  if (!/\s+state$/i.test(base)) candidates.add(`${base} State`);

  return Array.from(candidates);
};

export const fetchCitiesFromCountriesNow = async (
  countryName: string,
  stateName: string,
): Promise<string[]> => {
  const candidates = buildStateNameCandidates(stateName);

  for (const candidate of candidates) {
    try {
      const response = await axios.get<CountriesNowCitiesResponse>(
        `${COUNTRIESNOW_BASE_URL}/countries/state/cities/q`,
        {
          params: { country: countryName, state: candidate },
          timeout: 8000,
        },
      );

      const payload = response.data;
      if (
        !payload.error &&
        Array.isArray(payload.data) &&
        payload.data.length > 0
      ) {
        return payload.data;
      }
    } catch {
      // try next candidate
    }
  }

  return [];
};

export const fetchCitiesFromPackage = (
  countryIso: string,
  stateIso: string,
): string[] => {
  try {
    return City.getCitiesOfState(countryIso, stateIso).map((c) => c.name);
  } catch {
    return [];
  }
};
