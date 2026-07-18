import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/main.ts'],
  noExternal: ['@neuralpay'],
  splitting: false,
  bundle: true,
  outDir: './dist',
  clean: true,
  format: 'esm',
  env: { NODE_ENV: 'production' },
  sourcemap: true,
  minify: true,
  shims: true,
})
