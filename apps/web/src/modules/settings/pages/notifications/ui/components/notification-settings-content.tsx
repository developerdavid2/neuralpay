"use client";

import { useState } from "react";
import { useNotificationPreferences } from "@/modules/settings/pages/notifications/hooks/queries/use-notification-preferences";
import { useUpdateNotificationPreferences } from "@/modules/settings/pages/notifications/hooks/queries/use-update-notification-preferences";
import { useNotificationPermission } from "@/modules/notifications/hooks/mutations/use-notification-permission";
import { PushNotificationsSection } from "./push-notifications-section";
import { EmailNotificationsSection } from "./email-notifications-section";
import { PermissionPrompt } from "./permission-prompt";
import { AlertTypesSection } from "./alert-types-section";
import type { AlertPreferenceKey } from "../../constants";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Skeleton } from "@neuralpay/ui/components/skeleton";

export function NotificationSettingsContent() {
  const { data: preferences } = useNotificationPreferences();

  const pushMutation = useUpdateNotificationPreferences([
    "updatePreferences",
    "push",
  ]);
  const emailMutation = useUpdateNotificationPreferences([
    "updatePreferences",
    "email",
  ]);

  // Alert types: single mutation instance, but section handles per-toggle state
  const alertMutation = useUpdateNotificationPreferences([
    "updatePreferences",
    "alert",
  ]);

  const {
    permission,
    isSupported,
    isRequesting,
    requestPermission,
    unregister,
  } = useNotificationPermission();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  if (!preferences) return null;

  const handlePushToggle = async (checked: boolean) => {
    if (checked) {
      if (permission !== "granted") {
        setShowPermissionPrompt(true);
        return;
      }
    } else {
      await unregister();
    }
    pushMutation.mutate({ pushEnabled: checked });
  };

  const handlePushEnable = async () => {
    setShowPermissionPrompt(false);
    const token = await requestPermission();
    if (!token) return;
    pushMutation.mutate({ pushEnabled: true });
  };

  // Return a promise so AlertTypesSection can track individual toggle state
  const handleAlertToggle = (
    key: AlertPreferenceKey,
    checked: boolean,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      alertMutation.mutate(
        { [key]: checked },
        {
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        },
      );
    });
  };

  const handleEmailToggle = (checked: boolean) => {
    emailMutation.mutate({ emailEnabled: checked });
  };

  return (
    <div className="space-y-6">
      <PushNotificationsSection
        pushEnabled={preferences.pushEnabled}
        permission={permission}
        isSupported={isSupported}
        isLoading={pushMutation.isPending}
        onToggle={handlePushToggle}
      />

      <AlertTypesSection
        preferences={{
          transactionAlerts: preferences.transactionAlerts,
          accountAlerts: preferences.accountAlerts,
          insightsAlerts: preferences.insightsAlerts,
          coachAlerts: preferences.coachAlerts,
          budgetAlerts: preferences.budgetAlerts,
          splitNotifs: preferences.splitNotifs,
          vaultUpdates: preferences.vaultUpdates,
          weeklyReport: preferences.weeklyReport,
        }}
        onToggle={handleAlertToggle}
      />

      <EmailNotificationsSection
        emailEnabled={preferences.emailEnabled}
        isLoading={emailMutation.isPending}
        onToggle={handleEmailToggle}
      />

      <PermissionPrompt
        open={showPermissionPrompt}
        isRequesting={isRequesting}
        onConfirm={handlePushEnable}
        onCancel={() => setShowPermissionPrompt(false)}
      />
    </div>
  );
}
export function NotificationSettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Push notifications card skeleton */}
      <Card className="bg-card dark:drop-shadow-md">
        <CardHeader className="pb-0">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 rounded-3xl border border-border bg-main-tint p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-80" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert preferences card skeleton */}
      <Card className="bg-card dark:drop-shadow-md">
        <CardHeader className="pb-0">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-96" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-3xl border border-border bg-main-tint p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-72" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
