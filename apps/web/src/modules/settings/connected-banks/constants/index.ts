import PlaidLogo from "@/public/assets/logos/plaid";
import { Globe } from "lucide-react";
import type { JSX } from "react";

interface Provider {
  id: "plaid" | "mono";
  name: string;
  description: string;
  icon: React.ElementType;
  supportedCountries: string[];
  status?: "recommended" | "coming-soon";
}

export const PROVIDERS: Provider[] = [
  {
    id: "plaid",
    name: "Plaid",
    description: "Connect your account with Plaid",
    icon: PlaidLogo,
    status: "recommended",
    supportedCountries: ["United States", "Canada", "United Kingdom", "Europe"],
  },
  {
    id: "mono",
    name: "Mono",
    description: "Connect with Mono",
    icon: Globe, // same field name now
    status: "coming-soon",
    supportedCountries: ["Nigeria", "Kenya", "Ghana", "South Africa"],
  },
];
