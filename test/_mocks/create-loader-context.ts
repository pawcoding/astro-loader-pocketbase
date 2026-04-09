import type { LoaderContext } from "astro/loaders";
import { vi } from "vitest";
import { LoggerMock } from "./logger.mock";
import { StoreMock } from "./store.mock";

export function createLoaderContext(
  context?: Partial<LoaderContext>
): LoaderContext {
  return {
    collection: "testCollection",
    generateDigest: vi
      .fn<LoaderContext["generateDigest"]>()
      .mockReturnValue("digest"),
    logger: new LoggerMock(),
    // oxlint-disable-next-line vitest/require-mock-type-parameters
    parseData: vi.fn().mockResolvedValue({}),
    store: new StoreMock(),
    meta: new Map<string, string>(),
    ...context
  } satisfies Partial<LoaderContext> as unknown as LoaderContext;
}
