export interface CountryOption {
  value: string;
  label: string;
  flagEmoji: string;
  flagUrl: string;
  phonecode: string;
  currency: string;
  timezone: string | null;
}

export interface StateOption {
  value: string;
  label: string;
}

export interface CityOption {
  value: string;
  label: string;
}
