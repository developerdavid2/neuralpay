// apps/server/notification-service/src/test-notif.ts
import { emitNotification } from "@neuralpay/redis";
import { config } from "dotenv";
config({ path: "../../../.env" }); // Load root env before anything else

await emitNotification({
  event: {
    type: "transaction_created",
    payload: {
      userId: "lMpHXrQwQhCSRHZ9cXQ3YCPFK5UTlM3K",
      transactionId: "test-123",
      amount: 250.0,
      currency: "USD",
      merchant: "Starbucks",
      category: "Food",
    },
  },
});

console.log("Event fired");
