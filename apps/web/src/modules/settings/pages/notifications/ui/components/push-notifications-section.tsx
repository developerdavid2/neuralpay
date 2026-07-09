"use client";

import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Switch } from "@neuralpay/ui/components/switch";

interface PushNotificationsSectionProps {
  pushEnabled: boolean | null;
  permission: NotificationPermission | "default" | "denied" | "granted";
  isSupported: boolean;
  isLoading: boolean;
  onToggle: (checked: boolean) => void;
}

export function PushNotificationsSection({
  pushEnabled,
  permission,
  isSupported,
  isLoading,
  onToggle,
}: PushNotificationsSectionProps) {
  return (
    <Card className="bg-gray-400/5">
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold">Push notifications</p>
          <p className="text-sm text-muted-foreground">
            Enable browser push alerts for important account activity.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Browser push notifications</p>
              <p className="text-sm text-muted-foreground">
                When enabled, you&apos;ll receive push alerts even when the app
                is not active.
              </p>
            </div>
            <Switch
              checked={pushEnabled ?? true}
              onCheckedChange={onToggle}
              disabled={!isSupported || isLoading}
            />
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p>Browser permission: {permission}</p>
            {!isSupported && (
              <p className="text-destructive">
                Push notifications are not supported in this browser.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
