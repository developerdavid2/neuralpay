import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/main.ts"],
  outfile: "dist/handler.mjs",
  format: "esm",
  platform: "node",
  target: "node20",
  bundle: true,
  minify: false,
  sourcemap: false,
  external: ["node:*", "pg-native"],
  logLevel: "info",
});

console.log("✓ Bundled to dist/handler.mjs");
