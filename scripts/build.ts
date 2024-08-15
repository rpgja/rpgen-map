import { rm } from "fs/promises";
import { build } from "tsup";
import {resolve,join} from "node:path";

const root = resolve(import.meta.dirname, "../");
const distDir = join(root, "dist");
const tsconfig =  join(root,"tsconfig.json");

await rm(distDir, {recursive: true});
await build({
  target: "esnext",
  entry: ["src/**/*.ts"],
  clean: true,
  dts: true,
  sourcemap: true,
  format: "esm",
  tsconfig
});
