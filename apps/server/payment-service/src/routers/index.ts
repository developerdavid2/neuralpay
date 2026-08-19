import { router } from "@orra/config/trpc";
import { accountsRouter } from "./accounts.router";
import { budgetsRouter } from "./budgets.router";
import { transactionsRouter } from "./transactions.router";
import { plaidRouter } from "./plaid.router";

export const paymentsRouter = router({
  accounts: accountsRouter,
  transactions: transactionsRouter,
  budgets: budgetsRouter,
  plaid: plaidRouter,
});

export type PaymentRouter = typeof paymentsRouter;
