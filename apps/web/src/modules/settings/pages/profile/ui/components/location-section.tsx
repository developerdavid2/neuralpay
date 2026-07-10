"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Label } from "@neuralpay/ui/components/label";
import { Textarea } from "@neuralpay/ui/components/textarea";
import type { UpdateProfileInput } from "@neuralpay/types";
import { CountrySelect } from "./country-select";
import { StateSelect } from "./state-select";
import { CitySelect } from "./city-select";

interface LocationSectionProps {
  form: UseFormReturn<UpdateProfileInput>;
  country?: string;
  state?: string;
}

export function LocationSection({
  form,
  country,
  state,
}: LocationSectionProps) {
  return (
    <Card className="bg-card shadow-none drop-shadow-sm">
      <CardHeader className="pb-0">
        <p className="text-base font-semibold">Location</p>
        <p className="text-sm text-muted-foreground">
          Where you're based. Used for regional defaults and compliance.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Country</Label>
            <Controller
              name="country"
              control={form.control}
              render={({ field }) => (
                <CountrySelect
                  value={field.value ?? undefined}
                  onChange={(countryName, _isoCode, currency) => {
                    field.onChange(countryName);
                    form.setValue("state", "", { shouldDirty: true });
                    form.setValue("city", "", { shouldDirty: true });
                    if (currency)
                      form.setValue("currency", currency, {
                        shouldDirty: true,
                      });
                  }}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>State / Province</Label>
            <Controller
              name="state"
              control={form.control}
              render={({ field }) => (
                <StateSelect
                  countryName={country || undefined}
                  value={field.value ?? undefined}
                  onChange={(stateName) => {
                    field.onChange(stateName);
                    form.setValue("city", "", { shouldDirty: true });
                  }}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>City</Label>
            <Controller
              name="city"
              control={form.control}
              render={({ field }) => (
                <CitySelect
                  countryName={country || undefined}
                  stateName={state || undefined}
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <Controller
          name="address"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Street address, apartment, etc."
                rows={3}
              />
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
