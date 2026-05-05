import type { AppRouter as UsersAppRouter } from "@neuralpay/user-service/routers";

export type AppRouter = {
  users: UsersAppRouter["users"];
};
