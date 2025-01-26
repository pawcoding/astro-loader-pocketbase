import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts"],
    silent: true
  }
});
