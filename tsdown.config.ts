import { defineConfig } from "tsdown";

export default defineConfig({
  deps: {
    neverBundle: true
  },
  publint: true,
  exports: true
});
