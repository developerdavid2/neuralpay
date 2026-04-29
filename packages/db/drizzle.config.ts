// packages/db/drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import { resolve } from "path";

// For local migration runs, load from packages/db/.env
// In CI/CD, DATABASE_URL is injected as an environment variable directly
dotenv.config({ path: resolve(__dirname, ".env") });

// Fallback: try the server shared env
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: resolve(__dirname, "../../apps/server/.env.shared") });
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run migrations");
}

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
