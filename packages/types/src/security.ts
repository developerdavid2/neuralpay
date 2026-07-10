import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmNewPassword"],
      });
    }
  });

export const verify2FASchema = z.object({
  code: z.string().length(6),
});

export const disable2FASchema = z.object({
  password: z.string().min(1),
});

export const revokeSessionSchema = z.object({
  sessionToken: z.string(),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
export type Disable2FAInput = z.infer<typeof disable2FASchema>;
export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>;

export interface SessionInfo {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
}

export interface TwoFactorStatus {
  enabled: boolean;
}

export interface Enable2FAResult {
  qrCodeUri: string;
  backupSecretCodes: string[];
}

export interface Verify2FAResult {
  code: string;
}

export interface BackupCodesResult {
  backupSecretCodes: string[];
}
