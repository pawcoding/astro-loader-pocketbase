import type { LoaderContext } from "astro/loaders";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { loadEntries } from "../../src/loader/load-entries";
import { createLoaderContext } from "../_mocks/create-loader-context";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { createPocketbaseEntry } from "../_mocks/create-pocketbase-entry";

vi.mock("../../src/loader/fetch-collection");
vi.mock("../../src/loader/parse-entry");

describe("loadEntries", async () => {
  let context: LoaderContext;
  const options = createLoaderOptions();
  const fcm = await import("../../src/loader/fetch-collection");
  const pem = await import("../../src/loader/parse-entry");

  beforeEach(() => {
    context = createLoaderContext();
  });

  test("should call fetchCollection and parseEntry for each entry", async () => {
    const entry = createPocketbaseEntry();

    fcm.fetchCollection = vi.fn().mockImplementation(async (_, chunkLoaded) => {
      await chunkLoaded([entry]);
    });
    pem.parseEntry = vi.fn().mockImplementation((e) => e);

    await loadEntries(options, context, "superuser-token", undefined);

    expect(fcm.fetchCollection).toHaveBeenCalledWith(
      options,
      expect.any(Function),
      "superuser-token",
      { lastModified: undefined }
    );
    expect(pem.parseEntry).toHaveBeenCalledExactlyOnceWith(
      entry,
      context,
      options
    );
  });

  test("should pass lastModified to fetchCollection", async () => {
    const lastModified = "2023-12-01T10:00:00Z";

    fcm.fetchCollection = vi.fn().mockImplementation(async (_, chunkLoaded) => {
      await chunkLoaded([]);
    });

    await loadEntries(options, context, "superuser-token", lastModified);

    expect(fcm.fetchCollection).toHaveBeenCalledWith(
      options,
      expect.any(Function),
      "superuser-token",
      { lastModified }
    );
  });

  test("should work without token", async () => {
    fcm.fetchCollection = vi.fn().mockImplementation(async (_, chunkLoaded) => {
      await chunkLoaded([]);
    });

    await loadEntries(options, context, undefined, undefined);

    expect(fcm.fetchCollection).toHaveBeenCalledWith(
      options,
      expect.any(Function),
      undefined,
      { lastModified: undefined }
    );
  });

  test("should handle multiple chunks from fetchCollection", async () => {
    const entry1 = createPocketbaseEntry();
    const entry2 = createPocketbaseEntry();

    fcm.fetchCollection = vi.fn().mockImplementation(async (_, chunkLoaded) => {
      await chunkLoaded([entry1]);
      await chunkLoaded([entry2]);
    });
    pem.parseEntry = vi.fn().mockImplementation((e) => e);

    await loadEntries(options, context, undefined, undefined);

    expect(pem.parseEntry).toHaveBeenCalledTimes(2);
  });

  test("should handle empty chunks", async () => {
    fcm.fetchCollection = vi.fn().mockImplementation(async (_, chunkLoaded) => {
      await chunkLoaded([]);
    });
    pem.parseEntry = vi.fn().mockImplementation((e) => e);

    await loadEntries(options, context, undefined, undefined);

    expect(pem.parseEntry).not.toHaveBeenCalled();
  });
});
