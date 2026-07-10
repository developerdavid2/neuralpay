"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Switch } from "@neuralpay/ui/components/switch";
import { alertPreferenceRows, type AlertPreferenceKey } from "../../constants";

interface AlertTypesSectionProps {
  preferences: Record<AlertPreferenceKey, boolean | null>;
  onToggle: (key: AlertPreferenceKey, checked: boolean) => Promise<void> | void;
}

export function AlertTypesSection({
  preferences,
  onToggle,
}: AlertTypesSectionProps) {
  // Track which specific key is currently being toggled
  const [pendingKey, setPendingKey] = useState<AlertPreferenceKey | null>(null);

  const handleToggle = async (key: AlertPreferenceKey, checked: boolean) => {
    setPendingKey(key);
    try {
      await onToggle(key, checked);
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <Card className="bg-card dark:drop-shadow-md">
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold">Alert types</p>
          <p className="text-sm text-muted-foreground">
            Choose which types of activity you want to be notified about.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alertPreferenceRows.map(({ key, label, description }) => {
          const isPending = pendingKey === key;

          return (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-3xl border border-border bg-main-tint p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={preferences[key] ?? undefined}
                onCheckedChange={(checked) => handleToggle(key, checked)}
                disabled={isPending}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
