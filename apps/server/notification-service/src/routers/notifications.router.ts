import { z } from "zod";

import { protectedProcedure, router } from "@neuralpay/config/trpc";
import {
  markReadSchema,
  notificationsFilterSchema,
  registerDeviceSchema,
  updatePreferencesSchema,
} from "@neuralpay/types";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markManyRead,
  markManyUnread,
  markNotificationRead,
  markNotificationUnread,
  registerDevice,
} from "../services/notifications.service";

export const appNotificationRouter = router({
  list: protectedProcedure
    .input(
      notificationsFilterSchema
        .extend({
          cursor: z.string().uuid().optional(), // cursor for pagination
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const parsed = notificationsFilterSchema.parse(input ?? {});
      const result = await getNotifications(ctx.session.user.id, {
        ...parsed,
        cursor: input?.cursor,
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return getUnreadCount(ctx.session.user.id);
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await markNotificationRead(ctx.session.user.id, input.id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    }),

  markUnread: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await markNotificationUnread(
        ctx.session.user.id,
        input.id,
      );
      if (!result.success) throw new Error(result.error);
      return result.data;
    }),

  markManyRead: protectedProcedure
    .input(markReadSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await markManyRead(ctx.session.user.id, input.ids);
      if (!result.success) throw new Error(result.error);
      return result.data;
    }),

  markManyUnread: protectedProcedure
    .input(markReadSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await markManyUnread(ctx.session.user.id, input.ids);
      if (!result.success) throw new Error(result.error);
      return result.data;
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await markAllRead(ctx.session.user.id);
    if (!result.success) throw new Error(result.error);
    return result.data;
  }),

  registerDevice: protectedProcedure
    .input(registerDeviceSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await registerDevice(
        ctx.session.user.id,
        input.token,
        input.platform,
        input.deviceName,
      );
      if (!result.success) throw new Error(result.error);
      return result.data;
    }),

  // ── Get Preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    // TODO: implement DB fetch
    return {
      paymentAlerts: true,
      budgetAlerts: true,
      splitNotifs: true,
      vaultUpdates: true,
      weeklyReport: true,
      anomalyAlerts: true,
      emailEnabled: true,
      pushEnabled: true,
    };
  }),

  // ── Update Preferences
  updatePreferences: protectedProcedure
    .input(updatePreferencesSchema)
    .mutation(async ({}) => {
      // TODO: implement DB update
      return { success: true };
    }),
});
