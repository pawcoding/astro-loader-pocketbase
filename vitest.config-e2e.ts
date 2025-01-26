import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: ["test/**/*.e2e-spec.ts"],
    silent: true
  }
});
