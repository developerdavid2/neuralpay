import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/main.ts"],
    format: "esm",
    platform: "node",
    bundle: true,
    outDir: "dist",
    noExternal: [
      "@neuralpay/config",
      "@neuralpay/env",
      "@neuralpay/types",
      "@neuralpay/auth",
      "@neuralpay/db",
    ],
  },
  {
    entry: ["api/index.ts"],
    format: "esm",
    platform: "node",
    bundle: true,
    outDir: "dist/api",
    noExternal: [
      "@neuralpay/config",
      "@neuralpay/env",
      "@neuralpay/types",
      "@neuralpay/auth",
      "@neuralpay/db",
    ],
  },
]);
