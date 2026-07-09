"use client";

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
import { CURRENCIES, LANGUAGES, TIMEZONES } from "../../constants";

interface LanguageRegionSectionProps {
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  onChange: (field: keyof UpdateProfileInput, value: unknown) => void;
}

export function LanguageRegionSection({
  language,
  timezone,
  currency,
  dateFormat,
  onChange,
}: LanguageRegionSectionProps) {
  return (
    <Card className="bg-gray-400/5">
      <CardHeader className="pb-0">
        <p className="text-base font-semibold">Language & Region</p>
        <p className="text-sm text-muted-foreground">
          Customize how dates, times, and currency are displayed.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={language}
              onValueChange={(value) => onChange("language", value)}
            >
              <SelectTrigger id="language">
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

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(value) => onChange("timezone", value)}
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select
              value={currency}
              onValueChange={(value) => onChange("currency", value)}
            >
              <SelectTrigger id="currency">
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

          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select
              value={dateFormat}
              onValueChange={(value) => onChange("dateFormat", value)}
            >
              <SelectTrigger id="dateFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM_DD_YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD_MM_YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY_MM_DD">YYYY/MM/DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
