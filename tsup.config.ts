import { defineConfig } from "tsup";
import { join } from "node:path";

export default defineConfig({
  target: "esnext",
  entry: ["src/**/*.ts"],
  clean: true,
  dts: true,
  sourcemap: true,
  format: "esm",
  tsconfig: join(import.meta.dirname, "tsconfig.json")
});
