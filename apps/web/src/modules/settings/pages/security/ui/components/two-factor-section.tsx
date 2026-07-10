"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Button } from "@neuralpay/ui/components/button";
import { Badge } from "@neuralpay/ui/components/badge";
import { Input } from "@neuralpay/ui/components/input";
import { Label } from "@neuralpay/ui/components/label";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { toast } from "sonner";
import { use2FAStatus } from "../../hooks/queries/use-2fa-status";
import { useDisable2FA } from "../../hooks/mutations/use-disable-2fa";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { TwoFaSetupDialog } from "./two-fa-setup-dialog";

export function TwoFactorSection() {
  const { data: status } = use2FAStatus();
  const disable2FA = useDisable2FA();
  const [ConfirmDialog, confirm] = useConfirm();

  const [setupOpen, setSetupOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  const handleDisable = async () => {
    const ok = await confirm({
      title: "Disable two-factor authentication",
      message: "This will make your account less secure. Continue?",
      variant: "destructive",
      confirmLabel: "Disable",
    });
    if (!ok) return;

    disable2FA.mutate(
      { password: disablePassword },
      {
        onSuccess: () => {
          toast.success("Two-factor authentication disabled");
          setDisablePassword("");
        },
        onError: () => toast.error("Failed to update"),
      },
    );
  };

  return (
    <Card className="bg-main-tint">
      <ConfirmDialog />
      <CardHeader className="pb-0">
        <p className="text-base font-semibold">Two-Factor Authentication</p>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account.
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {status?.enabled ? (
          <>
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                Enabled
              </Badge>
            </div>
            <div className="space-y-2">
              <Label htmlFor="disable-password">
                Confirm password to disable
              </Label>
              <Input
                id="disable-password"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleDisable}
              disabled={!disablePassword || disable2FA.isPending}
              className="text-destructive hover:text-destructive"
            >
              {disable2FA.isPending ? "Disabling..." : "Disable 2FA"}
            </Button>
          </>
        ) : (
          <>
            <Badge variant="outline" className="text-muted-foreground">
              Disabled
            </Badge>
            <div>
              <Button onClick={() => setSetupOpen(true)}>Enable 2FA</Button>
            </div>
          </>
        )}
      </CardContent>

      <TwoFaSetupDialog open={setupOpen} onOpenChange={setSetupOpen} />
    </Card>
  );
}
