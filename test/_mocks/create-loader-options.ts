import type { PocketBaseLoaderOptions } from "../../src/types/pocketbase-loader-options.type";

export function createLoaderOptions(
  options?: Partial<PocketBaseLoaderOptions>
): PocketBaseLoaderOptions {
  return {
    url: "http://127.0.0.1:8090",
    collectionName: "test",
    superuserCredentials: {
      email: "test@pawcode.de",
      password: "test1234"
    },
    ...options
  };
}
