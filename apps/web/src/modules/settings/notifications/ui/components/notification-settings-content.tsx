"use client";

import { useState } from "react";
import { useNotificationPreferences } from "@/modules/settings/notifications/hooks/queries/use-notification-preferences";
import { useUpdateNotificationPreferences } from "@/modules/settings/notifications/hooks/queries/use-update-notification-preferences";
import { useNotificationPermission } from "@/modules/notifications/hooks/mutations/use-notification-permission";
import { PushNotificationsSection } from "./push-notifications-section";
import { EmailNotificationsSection } from "./email-notifications-section";
import { PermissionPrompt } from "./permission-prompt";
import { AlertTypesSection } from "./alert-types-section";
import type { AlertPreferenceKey } from "../../constants";

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
