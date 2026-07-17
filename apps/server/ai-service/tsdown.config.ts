import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/main.ts", "api/index.ts"],
  format: "esm",
  platform: "node",
  bundle: true,
  external: ["node:*"],
});
