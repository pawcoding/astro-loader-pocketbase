import type { PocketBaseLoaderOptions } from "../../src/types/pocketbase-loader-options.type";

export function createLoaderOptions(
  options?: Partial<PocketBaseLoaderOptions>
): PocketBaseLoaderOptions {
  return {
    url: "https://example.com",
    collectionName: "test",
    ...options
  };
}
