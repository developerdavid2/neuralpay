import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/serverless.ts"],
  noExternal: [/@neuralpay/],
  external: ["ioredis", "bullmq", "rate-limiter-flexible"],
  splitting: false,
  bundle: true,
  outDir: "dist",
  clean: true,
  minify: false,
  sourcemap: true,
  format: ["esm"],
  target: "node20",
});
