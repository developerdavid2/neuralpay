"use client";

import { useState } from "react";
import { Button } from "@neuralpay/ui/components/button";
import { Input } from "@neuralpay/ui/components/input";
import { Label } from "@neuralpay/ui/components/label";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { toast } from "sonner";
import { useChangePassword } from "../../hooks/mutations/use-change-password";

function getStrength(password: string): {
  label: string;
  color: string;
  score: number;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", color: "bg-red-500", score };
  if (score <= 3) return { label: "Medium", color: "bg-yellow-500", score };
  return { label: "Strong", color: "bg-green-500", score };
}

export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = useChangePassword();
  const strength = getStrength(newPassword);

  const passwordsMatch = newPassword === confirmPassword;
  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword.length > 0 &&
    passwordsMatch;

  const handleSubmit = () => {
    if (!isValid) return;

    changePassword.mutate(
      { currentPassword, newPassword, confirmNewPassword: confirmPassword },
      {
        onSuccess: () => {
          toast.success("Password updated");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: () => toast.error("Failed to update"),
      },
    );
  };

  return (
    <Card className="bg-card shadow-none drop-shadow-sm">
      <CardHeader className="pb-0">
        <p className="text-base font-semibold">Change Password</p>
        <p className="text-sm text-muted-foreground">
          Update your account password.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 ">
        <div className="space-y-2 max-w-[80%]">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="rounded-xl"
            autoComplete="current-password"
          />
        </div>

        <div className="space-y-2 max-w-[80%]">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-xl"
            autoComplete="new-password"
          />
          {newPassword.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1 h-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full ${
                      i < Math.ceil(strength.score / 1.67)
                        ? strength.color
                        : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{strength.label}</p>
            </div>
          )}
        </div>

        <div className="space-y-2 max-w-[80%]">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-xl"
            autoComplete="new-password"
            aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-destructive">Passwords don't match</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || changePassword.isPending}
          >
            {changePassword.isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
