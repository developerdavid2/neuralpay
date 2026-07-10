import type {
  BackupCodesResult,
  Enable2FAResult,
  ServiceResult,
  SessionInfo,
  TwoFactorStatus,
  Verify2FAResult,
} from "@neuralpay/types";
import { auth } from "../lib/auth";
import { UsersService } from "./users.service";

export const SecurityService = {
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    headers: Headers,
  ): Promise<ServiceResult<void>> {
    try {
      await UsersService.getById(userId);
      await auth.api.changePassword({
        body: { currentPassword, newPassword, revokeOtherSessions: true },
        headers,
      });
      return { success: true, data: undefined };
    } catch (err) {
      console.error("[SecurityService.changePassword]", err);
      return {
        success: false,
        error: "Failed to change password. Please check your current password.",
        code: "BAD_REQUEST",
      };
    }
  },

  // security.service.ts
  async getSessions(headers: Headers): Promise<ServiceResult<SessionInfo[]>> {
    try {
      const [sessions, current] = await Promise.all([
        auth.api.listSessions({ headers }),
        auth.api.getSession({ headers }),
      ]);

      const currentToken = current?.session?.token;

      const withCurrent = (sessions as SessionInfo[]).map((s) => ({
        ...s,
        isCurrent: s.token === currentToken,
      }));

      return { success: true, data: withCurrent };
    } catch (err) {
      console.error("[SecurityService.getSessions]", err);
      return {
        success: false,
        error: "Failed to load sessions",
        code: "DB_ERROR",
      };
    }
  },
  async revokeSession(
    sessionToken: string,
    headers: Headers,
  ): Promise<ServiceResult<void>> {
    try {
      await auth.api.revokeSession({
        body: { token: sessionToken },
        headers,
      });
      return { success: true, data: undefined };
    } catch (err) {
      console.error("[SecurityService.revokeSession]", err);
      return {
        success: false,
        error: "Failed to revoke session",
        code: "BAD_REQUEST",
      };
    }
  },

  async revokeOtherSessions(): Promise<ServiceResult<void>> {
    try {
      await auth.api.revokeOtherSessions();
      return { success: true, data: undefined };
    } catch (err) {
      console.error("[SecurityService.revokeOtherSessions]", err);
      return {
        success: false,
        error: "Failed to sign out other devices",
        code: "BAD_REQUEST",
      };
    }
  },

  async get2FAStatus(userId: string): Promise<ServiceResult<TwoFactorStatus>> {
    try {
      const result = await UsersService.getById(userId);

      if (!result.success) {
        return { success: false, error: "User not found", code: "NOT_FOUND" };
      }

      return { success: true, data: { enabled: result.data.twoFactorEnabled } };
    } catch (err) {
      console.error("[SecurityService.get2FAStatus]", err);
      return {
        success: false,
        error: "Failed to load 2FA status",
        code: "DB_ERROR",
      };
    }
  },

  async enable2FA(
    password: string,
    headers: Headers,
  ): Promise<ServiceResult<Enable2FAResult>> {
    try {
      const result = await auth.api.enableTwoFactor({
        body: { password, issuer: "Neuralpay AI" },
        headers,
      });
      return {
        success: true,
        data: {
          qrCodeUri: result.totpURI,
          backupSecretCodes: result.backupCodes,
        },
      };
    } catch (err) {
      console.error("[SecurityService.enable2FA]", err);
      return {
        success: false,
        error: "Failed to enable 2FA. Please check your password.",
        code: "BAD_REQUEST",
      };
    }
  },

  async verify2FA(
    code: string,
    headers: Headers,
  ): Promise<ServiceResult<Verify2FAResult>> {
    try {
      const result = await auth.api.verifyTOTP({
        body: { code },
        headers,
      });
      return {
        success: true,
        data: { code: result.token },
      };
    } catch (err) {
      console.error("[SecurityService.verify2FA]", err);
      return {
        success: false,
        error: "Invalid verification code",
        code: "BAD_REQUEST",
      };
    }
  },

  async disable2FA(
    password: string,
    headers: Headers,
  ): Promise<ServiceResult<void>> {
    try {
      await auth.api.disableTwoFactor({
        body: { password },
        headers,
      });
      return { success: true, data: undefined };
    } catch (err) {
      console.error("[SecurityService.disable2FA]", err);
      return {
        success: false,
        error: "Failed to disable 2FA. Please check your password.",
        code: "BAD_REQUEST",
      };
    }
  },

  async getBackupCodes(
    userId: string,
  ): Promise<ServiceResult<BackupCodesResult>> {
    try {
      const result = await auth.api.viewBackupCodes({
        body: {
          userId,
        },
      });
      return {
        success: true,
        data: { backupSecretCodes: result.backupCodes ?? [] },
      };
    } catch (err) {
      console.error("[SecurityService.getBackupCodes]", err);
      return {
        success: false,
        error: "Failed to load backup codes",
        code: "BAD_REQUEST",
      };
    }
  },
};
