import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts", "test/**/*.e2e-spec.ts"],
    silent: true,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/types/**/*.ts", "src/index.ts", "src/pocketbase-loader.ts"]
    },
    restoreMocks: true
  }
});
