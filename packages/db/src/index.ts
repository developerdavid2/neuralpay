import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

export function createDb() {
  return drizzle(DATABASE_URL!, { schema });
}

export const db = createDb();

export * from "./schema";
