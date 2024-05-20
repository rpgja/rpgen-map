import { defineConfig } from "tsup";

export default defineConfig({
  target: "esnext",
  entry: ["src/**/*.ts"],
  clean: true,
  dts: true,
  sourcemap: true,
  format: "esm"
});
