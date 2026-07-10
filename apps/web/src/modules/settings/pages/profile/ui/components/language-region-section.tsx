"use client";

import { useEffect } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Label } from "@neuralpay/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import type { UpdateProfileInput } from "@neuralpay/types";
import { CURRENCIES, LANGUAGES } from "../../constants";

function useBrowserTimezone() {
  const timezone =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "";

  const utcOffset = timezone
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
      })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")
        ?.value?.replace("GMT", "UTC")
    : "";

  return { timezone, utcOffset };
}

export function LanguageRegionSection({
  form,
}: {
  form: UseFormReturn<UpdateProfileInput>;
}) {
  const { timezone, utcOffset } = useBrowserTimezone();

  useEffect(() => {
    if (timezone) {
      form.setValue("timezone", timezone, { shouldDirty: false });
    }
  }, [timezone]);

  return (
    <Card className="bg-card shadow-none drop-shadow-sm">
      <CardHeader className="pb-0">
        <p className="text-base font-semibold">Language & Region</p>
        <p className="text-sm text-muted-foreground">
          Customize how dates and currency are displayed.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-3">
          <Controller
            name="language"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="currency"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="currency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <div className="space-y-2">
            <Label>Timezone</Label>
            <div className="flex h-10 items-center rounded-xl border border-input bg-secondary/30 px-3 text-sm text-muted-foreground">
              {timezone || "Detecting..."}
              {utcOffset && <span className="ml-2 text-xs">({utcOffset})</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
