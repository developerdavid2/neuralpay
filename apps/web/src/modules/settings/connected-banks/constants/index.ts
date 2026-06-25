import { Building2, Globe, type LucideIcon } from "lucide-react";

interface Provider {
  id: "plaid" | "mono";
  name: string;
  description: string;
  icon: LucideIcon;
  supportedCountries: string[];
  status?: "recommended" | "coming-soon";
}

export const PROVIDERS: Provider[] = [
  {
    id: "plaid",
    name: "Plaid",
    description: "Connect your account with Plaid",
    icon: Building2,
    status: "recommended",
    supportedCountries: ["United States", "Canada", "United Kingdom", "Europe"],
  },
  {
    id: "mono",
    name: "Mono",
    description: "Connect with Mono",
    icon: Globe,
    status: "coming-soon",
    supportedCountries: ["Nigeria", "Kenya", "Ghana", "South Africa"],
  },
];
