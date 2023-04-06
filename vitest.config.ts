import { defineConfig } from "vitest/config";
import babel from "@rollup/plugin-babel";

const babelPlugin = babel({
  exclude: /node_modules.*/,
  sourceMaps: true,
  babelHelpers: "bundled",
  extensions: [".ts"],
});

export default defineConfig({
  plugins: [babelPlugin],
});
