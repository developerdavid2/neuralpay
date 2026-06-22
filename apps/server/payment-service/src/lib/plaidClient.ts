import { paymentServiceEnv } from "@neuralpay/env/payment";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

export const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[paymentServiceEnv.PLAID_ENV],
    baseOptions: {
      timeout: 10_000,
      headers: {
        "PLAID-CLIENT-ID": paymentServiceEnv.PLAID_CLIENT_ID,
        "PLAID-SECRET": paymentServiceEnv.PLAID_SECRET,
      },
    },
  }),
);
