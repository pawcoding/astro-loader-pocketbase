import { defineConfig } from "tsdown";

export default defineConfig({
  dts: {
    sourcemap: true
  },
  deps: {
    skipNodeModulesBundle: true
  },
  publint: true,
  exports: true
});
