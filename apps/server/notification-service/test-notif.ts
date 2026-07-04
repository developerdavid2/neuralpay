// apps/server/notification-service/src/test-notif.ts
import { emitNotification } from "@neuralpay/redis";
import { config } from "dotenv";
config({ path: "../../../.env" });

await emitNotification({
  event: {
    type: "transaction_created",
    payload: {
      userId: "lMpHXrQwQhCSRHZ9cXQ3YCPFK5UTlM3K",
      transactionId: "test-1256",
      amount: 40000.0,
      currency: "USD",
      merchant: "Games",
      category: "Blues",
    },
  },
});

console.log("Event fired");
