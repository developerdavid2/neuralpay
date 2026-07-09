"use client";

import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Input } from "@neuralpay/ui/components/input";
import { Label } from "@neuralpay/ui/components/label";
import { Textarea } from "@neuralpay/ui/components/textarea";
import type { UpdateProfileInput } from "@neuralpay/types";

interface LocationSectionProps {
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  onChange: (field: keyof UpdateProfileInput, value: unknown) => void;
}

export function LocationSection({
  country,
  state,
  city,
  address,
  onChange,
}: LocationSectionProps) {
  return (
    <Card className="bg-gray-400/5">
      <CardHeader className="pb-0">
        <p className="text-base font-semibold">Location</p>
        <p className="text-sm text-muted-foreground">
          Your address helps us personalize your experience.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country ?? ""}
              onChange={(e) => onChange("country", e.target.value || null)}
              placeholder="United States"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State / Region</Label>
            <Input
              id="state"
              value={state ?? ""}
              onChange={(e) => onChange("state", e.target.value || null)}
              placeholder="California"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city ?? ""}
              onChange={(e) => onChange("city", e.target.value || null)}
              placeholder="San Francisco"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Textarea
            id="address"
            value={address ?? ""}
            onChange={(e) => onChange("address", e.target.value || null)}
            placeholder="123 Main St, Apt 4B"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
