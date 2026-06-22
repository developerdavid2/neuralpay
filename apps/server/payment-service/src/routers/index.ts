import { router } from "@neuralpay/config/trpc";
import { accountsRouter } from "./accounts.router";
import { transactionsRouter } from "./transactions.router";
import { plaidRouter } from "./plaid.router";

export const paymentsRouter = router({
  accounts: accountsRouter,
  transactions: transactionsRouter,
  plaid: plaidRouter,
});

export type PaymentRouter = typeof paymentsRouter;
