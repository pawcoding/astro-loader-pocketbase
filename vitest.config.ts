import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts", "test/**/*.e2e-spec.ts"],
    silent: true,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/types/**/*.ts", "src/index.ts"]
    },
    restoreMocks: true,
    globalSetup: "./test/global-setup.ts",
    tags: [
      {
        name: "e2e",
        description: "End-to-end tests that require a running database."
      },
      {
        name: "unit",
        description: "Unit tests that do not require a running database."
      }
    ]
  }
});
