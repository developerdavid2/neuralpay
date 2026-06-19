"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@neuralpay/ui/components/dialog";
import { Button } from "@neuralpay/ui/components/button";
import { Card, CardContent } from "@neuralpay/ui/components/card";
import { Badge } from "@neuralpay/ui/components/badge";
import {
  Building2,
  CheckCircle2,
  Globe,
  Zap,
  ArrowRight,
  Lock,
} from "lucide-react";
import { cn } from "@neuralpay/ui/lib/utils";

interface ProviderSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (provider: "plaid" | "mono") => void;
}

interface Provider {
  id: "plaid" | "mono";
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  status?: "recommended" | "coming-soon";
  supportedCountries: string[];
}

const PROVIDERS: Provider[] = [
  {
    id: "plaid",
    name: "Plaid",
    description: "Connect your bank account securely with Plaid",
    icon: <Building2 className="h-8 w-8" />,
    status: "recommended",
    features: [
      "60,000+ financial institutions",
      "Real-time transaction sync",
      "Account verification",
      "Instant setup",
    ],
    supportedCountries: ["United States", "Canada", "United Kingdom", "Europe"],
  },
  {
    id: "mono",
    name: "Mono",
    description: "Fast and secure bank connections in Africa",
    icon: <Globe className="h-8 w-8" />,
    status: "coming-soon",
    features: [
      "5,000+ African banks",
      "Easy authentication",
      "Account aggregation",
      "Transaction history",
    ],
    supportedCountries: ["Nigeria", "Kenya", "Ghana", "South Africa"],
  },
];

export function ProviderSelectModal({
  open,
  onClose,
  onSelect,
}: ProviderSelectModalProps) {
  const [selectedId, setSelectedId] = useState<"plaid" | "mono" | null>(null);

  const handleSelect = (providerId: "plaid" | "mono") => {
    setSelectedId(providerId);
    onSelect(providerId);
    setSelectedId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Bank</DialogTitle>
          <DialogDescription>
            Select your preferred provider to securely connect your bank account
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          {PROVIDERS.map((provider) => (
            <Card
              key={provider.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md border-2",
                selectedId === provider.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                provider.status === "coming-soon" && "opacity-60",
              )}
              onClick={() =>
                provider.status !== "coming-soon" && handleSelect(provider.id)
              }
            >
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {provider.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">
                        {provider.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                  {provider.status === "recommended" && (
                    <Badge
                      className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 shrink-0"
                      variant="secondary"
                    >
                      Recommended
                    </Badge>
                  )}
                  {provider.status === "coming-soon" && (
                    <Badge
                      className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 shrink-0"
                      variant="secondary"
                    >
                      Coming soon
                    </Badge>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Key Features
                  </p>
                  <div className="grid gap-2">
                    {provider.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supported Countries */}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Supported Regions
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {provider.supportedCountries.map((country, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs py-0.5"
                      >
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleSelect(provider.id)}
                  disabled={provider.status === "coming-soon"}
                  className="w-full gap-2 mt-4"
                  variant={
                    provider.status === "coming-soon" ? "secondary" : "default"
                  }
                >
                  {provider.status === "coming-soon" ? (
                    <>
                      <Zap className="h-4 w-4" />
                      Coming Soon
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Connect with {provider.name}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <Lock className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <span>
              Your credentials are never stored. We use read-only access via
              OAuth for maximum security.
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
