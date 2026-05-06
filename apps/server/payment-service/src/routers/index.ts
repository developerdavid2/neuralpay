import { router } from "@neuralpay/config/trpc";
import { accountsRouter } from "./accounts.router";
import { transactionsRouter } from "./transactions.router";

export const paymentsRouter = router({
  accounts: accountsRouter,
  transactions: transactionsRouter,
});

export type PaymentRouter = typeof paymentsRouter;
