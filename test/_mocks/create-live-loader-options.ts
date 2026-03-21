import type { PocketBaseLiveLoaderOptions } from "../../src/types/pocketbase-loader-options.type";

export function createLiveLoaderOptions(
  options?: Partial<PocketBaseLiveLoaderOptions>
): PocketBaseLiveLoaderOptions {
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
