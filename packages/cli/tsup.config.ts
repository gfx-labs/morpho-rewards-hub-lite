import { defineConfig } from "tsup";

export default defineConfig({
  target: ["node14"],
  entryPoints: ["src/index.ts"],
  format: ["esm", "cjs"],
  outDir: "lib",
  sourcemap: true,
  dts: true,
  clean: true,
  shims: true,
});
