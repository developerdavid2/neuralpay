import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export function createDb() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

  return drizzle(DATABASE_URL, { schema });
}

export const db = createDb();
export * from "./schema";
export { dbEnv } from "./env";
