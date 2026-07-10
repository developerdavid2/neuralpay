"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  disable2FASchema,
  verify2FASchema,
  type Disable2FAInput,
  type Enable2FAResult,
  type Verify2FAInput,
} from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@neuralpay/ui/components/dialog";
import { Input } from "@neuralpay/ui/components/input";
import { Label } from "@neuralpay/ui/components/label";
import { Check, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEnable2FA } from "../../hooks/mutations/use-enable-2fa";
import { useVerify2FA } from "../../hooks/mutations/use-verify-2fa";

type Step = "password" | "qr" | "verify" | "backup-codes";

export function TwoFaSetupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<Step>("password");
  const [qrUri, setQrUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const enable2FA = useEnable2FA();
  const verify2FA = useVerify2FA();

  // Password step form
  const passwordForm = useForm<Disable2FAInput>({
    resolver: zodResolver(disable2FASchema),
    defaultValues: { password: "" },
  });

  // Verify step form
  const verifyForm = useForm<Verify2FAInput>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: { code: "" },
  });

  const reset = () => {
    setStep("password");
    setQrUri("");
    setBackupCodes([]);
    setCopied(false);
    passwordForm.reset();
    verifyForm.reset();
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const handlePasswordSubmit = passwordForm.handleSubmit((data) => {
    enable2FA.mutate(
      { password: data.password },
      {
        onSuccess: (result) => {
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          // Now TypeScript knows result.data is Enable2FAResult
          setQrUri(result.data.qrCodeUri);
          setBackupCodes(result.data.backupSecretCodes);
          setStep("qr");
        },
      },
    );
  });

  const handleVerify = verifyForm.handleSubmit((data) => {
    verify2FA.mutate(data, {
      onSuccess: () => {
        setStep("backup-codes");
      },
    });
  });

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCodes = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "neuralpay-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stepIndex = { password: 1, qr: 2, verify: 3, "backup-codes": 4 }[step];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>Step {stepIndex} of 4</DialogDescription>
        </DialogHeader>

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="2fa-password">Confirm your password</Label>
              <Input
                id="2fa-password"
                type="password"
                {...passwordForm.register("password")}
                className="rounded-xl"
              />
              {passwordForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={enable2FA.isPending}
              className="w-full"
            >
              {enable2FA.isPending ? "Verifying..." : "Continue"}
            </Button>
          </form>
        )}

        {step === "qr" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc).
            </p>
            <div className="flex justify-center p-4 bg-white rounded-xl">
              <QRCodeSVG value={qrUri} size={200} />
            </div>
            <Button onClick={() => setStep("verify")} className="w-full">
              I've scanned the code
            </Button>
          </div>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totp-code">Enter the 6-digit code</Label>
              <Input
                id="totp-code"
                {...verifyForm.register("code", {
                  onChange: (e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);
                  },
                })}
                className="rounded-xl text-center text-lg tracking-widest"
                placeholder="000000"
                inputMode="numeric"
              />
              {verifyForm.formState.errors.code && (
                <p className="text-sm text-destructive">
                  {verifyForm.formState.errors.code.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={verify2FA.isPending}
              className="w-full"
            >
              {verify2FA.isPending ? "Verifying..." : "Verify"}
            </Button>
          </form>
        )}

        {step === "backup-codes" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Save these backup codes somewhere safe. Each can be used once if
              you lose access to your authenticator.
            </p>
            <div className="grid grid-cols-2 gap-2 p-3 bg-secondary/30 rounded-xl font-mono text-sm">
              {backupCodes.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopyCodes}
                className="flex-1"
              >
                {copied ? (
                  <Check className="size-4 mr-2" />
                ) : (
                  <Copy className="size-4 mr-2" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadCodes}
                className="flex-1"
              >
                Download
              </Button>
            </div>
            <Button
              onClick={() => {
                toast.success("Two-factor authentication enabled");
                handleClose(false);
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
