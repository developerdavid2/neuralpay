import { notificationsServiceEnv } from "@neuralpay/env/notifications";
import { cert, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import {
  deactivateDeviceTokens,
  getActiveDeviceTokens,
} from "../services/notifications.service";

const app = initializeApp({
  credential: cert(JSON.parse(notificationsServiceEnv.FCM_SERVICE_ACCOUNT!)),
});
const messaging = getMessaging(app);

export async function sendPush(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  const tokens = await getActiveDeviceTokens(userId);
  console.log(`[sendPush] user ${userId}, active tokens: ${tokens.length}`);
  if (!tokens.length) {
    console.log("[sendPush] no active tokens, skipping");
    return;
  }

  const fids = tokens.map((t) => t.token);
  console.log(`[sendPush] sending to FIDs: ${fids.join(", ")}`);

  const response = await messaging.sendEachForMulticast({
    notification: { title, body },
    data: data
      ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
      : {},
    tokens: tokens.map((t) => t.token),
  });
  response.responses.forEach((r, i) => {
    if (!r.success) {
      console.error(`[sendPush] FID ${i} failed:`, r.error?.message);
    }
  });

  const dead = response.responses
    .map((r, i) => (!r.success ? tokens[i]?.token : null))
    .filter((token): token is string => !!token);

  if (dead.length) {
    console.log(`[sendPush] deactivating ${dead.length} dead FIDs`);
    await deactivateDeviceTokens(dead);
  }
}
