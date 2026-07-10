import type { CityOption, CountryOption, StateOption } from "@neuralpay/types";
import { Country, State } from "country-state-city";
import {
  dedupeCities,
  fetchCitiesFromCountriesNow,
  fetchCitiesFromPackage,
} from "../lib/location";

// isoCode -> full country name, needed because countriesnow.space
// takes names, not iso codes
let isoToNameCache: Map<string, string> | null = null;
const getIsoToNameMap = (): Map<string, string> => {
  if (isoToNameCache) return isoToNameCache;
  isoToNameCache = new Map(
    Country.getAllCountries().map((c) => [c.isoCode, c.name]),
  );
  return isoToNameCache;
};

const countriesCache = new Map<string, CountryOption>();
let allCountriesCache: CountryOption[] | null = null;
const statesCache = new Map<string, StateOption[]>();
const citiesCache = new Map<string, CityOption[]>();

export const LocationService = {
  getAllCountries(): CountryOption[] {
    if (allCountriesCache) return allCountriesCache;

    allCountriesCache = Country.getAllCountries().map((c) => {
      const option: CountryOption = {
        value: c.isoCode,
        label: c.name,
        flagEmoji: c.flag,
        flagUrl: `https://flagcdn.com/${c.isoCode.toLowerCase()}.svg`,
        phonecode: c.phonecode.startsWith("+")
          ? c.phonecode
          : `+${c.phonecode}`,
        currency: c.currency,
        timezone: c.timezones?.[0]?.zoneName ?? null,
      };
      countriesCache.set(c.isoCode, option);
      return option;
    });

    return allCountriesCache;
  },

  getCountryByIso(isoCode: string): CountryOption | null {
    if (countriesCache.size === 0) this.getAllCountries();
    return countriesCache.get(isoCode.toUpperCase()) ?? null;
  },

  getStatesByCountry(countryIso: string): StateOption[] {
    const key = countryIso.toUpperCase();
    const cached = statesCache.get(key);
    if (cached) return cached;

    const states = State.getStatesOfCountry(key).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }));

    statesCache.set(key, states);
    return states;
  },

  /**
   * Merges countriesnow.space + country-state-city, since neither source is
   * complete on its own (e.g. country-state-city only returns ~4-5 "cities"
   * for Lagos instead of all 20 LGAs). Unioning both and deduping gives the
   * fullest possible list regardless of which source is weak for a given
   * country/state.
   */
  async getCitiesByState(
    countryIso: string,
    stateIso: string,
  ): Promise<CityOption[]> {
    const countryKey = countryIso.toUpperCase();
    const stateKey = stateIso.toUpperCase();
    const cacheKey = `${countryKey}|${stateKey}`;

    const cached = citiesCache.get(cacheKey);
    if (cached) return cached;

    const state = State.getStateByCodeAndCountry(stateKey, countryKey);
    const countryName = getIsoToNameMap().get(countryKey);

    const [apiCities, packageCities] = await Promise.all([
      state && countryName
        ? fetchCitiesFromCountriesNow(countryName, state.name)
        : Promise.resolve<string[]>([]),
      Promise.resolve(fetchCitiesFromPackage(countryKey, stateKey)),
    ]);

    let merged = dedupeCities([...apiCities, ...packageCities]);

    // Fallback: no cities from either source -> the state name doubles as
    // the city (e.g. "London Borough of Barnet" for both State and City)
    if (merged.length === 0 && state) {
      merged = [{ value: state.name, label: state.name }];
    }

    if (merged.length > 0) {
      citiesCache.set(cacheKey, merged);
    }

    return merged;
  },
  getDialCodes(): Array<{
    value: string;
    label: string;
    flagEmoji: string;
    flagUrl: string;
    isoCode: string;
  }> {
    return this.getAllCountries()
      .filter((c) => c.phonecode && c.phonecode !== "+")
      .map((c) => ({
        value: c.phonecode,
        label: `${c.phonecode} ${c.flagEmoji} ${c.label}`,
        flagEmoji: c.flagEmoji,
        flagUrl: c.flagUrl,
        isoCode: c.value,
      }));
  },
};
