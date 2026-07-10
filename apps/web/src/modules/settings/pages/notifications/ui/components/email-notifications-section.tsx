"use client";

import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Switch } from "@neuralpay/ui/components/switch";
import { emailPreferenceRows } from "../../constants";

interface EmailNotificationsSectionProps {
  emailEnabled: boolean | null;
  isLoading: boolean;
  onToggle: (checked: boolean) => void;
}

export function EmailNotificationsSection({
  emailEnabled,
  isLoading,
  onToggle,
}: EmailNotificationsSectionProps) {
  return (
    <Card className="bg-card dark:drop-shadow-md">
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold">Email notifications</p>
          <p className="text-sm text-muted-foreground">
            Control whether you receive notification emails.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {emailPreferenceRows.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex flex-col gap-3 rounded-3xl border border-border bg-main-tint p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch
              checked={emailEnabled ?? true}
              onCheckedChange={onToggle}
              disabled={isLoading}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
