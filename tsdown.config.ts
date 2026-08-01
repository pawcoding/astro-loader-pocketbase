import { defineConfig } from "tsdown";

export default defineConfig({
  dts: {
    sourcemap: true
  },
  deps: {
    neverBundle: true
  },
  publint: true,
  exports: true
});
