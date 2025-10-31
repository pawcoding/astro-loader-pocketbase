import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { liveCollectionLoader } from "../../src/loader/live-collection-loader";
import { createLiveLoaderOptions } from "../_mocks/create-live-loader-options";
import { createPocketbaseEntry } from "../_mocks/create-pocketbase-entry";

vi.mock("../../src/loader/fetch-collection");
vi.mock("../../src/loader/parse-live-entry");

describe("liveCollectionLoader", async () => {
  const options = createLiveLoaderOptions();
  const fcm = await import("../../src/loader/fetch-collection");
  const plem = await import("../../src/loader/parse-live-entry");

  beforeEach(() => {
    plem.parseLiveEntry = vi.fn().mockImplementation((e) => e);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should return live data collection with parsed entries", async () => {
    const entry = createPocketbaseEntry();

    fcm.fetchCollection = vi.fn().mockImplementation(async (_, chunkLoaded) => {
      await chunkLoaded([entry]);
    });

    const result = await liveCollectionLoader(
      undefined,
      options,
      "superuser-token"
    );

    expect(fcm.fetchCollection).toHaveBeenCalledWith(
      options,
      expect.any(Function),
      "superuser-token",
      undefined
    );
    expect(plem.parseLiveEntry).toHaveBeenCalledOnce();

    expect("error" in result).toBeFalsy();
    expect("entries" in result).toBeTruthy();
    if ("entries" in result) {
      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toEqual(entry);
    }
  });

  test("should pass collection filter to fetchCollection", async () => {
    const collectionFilter = {
      filter: "status=active",
      page: 1,
      perPage: 50,
      sort: "-created"
    };

    fcm.fetchCollection = vi.fn().mockImplementation(async (_, chunkLoaded) => {
      await chunkLoaded([]);
    });

    const result = await liveCollectionLoader(
      collectionFilter,
      options,
      "superuser-token"
    );

    expect("error" in result).toBeFalsy();
    expect(fcm.fetchCollection).toHaveBeenCalledWith(
      options,
      expect.any(Function),
      "superuser-token",
      collectionFilter
    );
  });

  test("should work without token", async () => {
    fcm.fetchCollection = vi.fn().mockImplementation(async (_, chunkLoaded) => {
      await chunkLoaded([]);
    });

    const result = await liveCollectionLoader(undefined, options, undefined);

    expect("error" in result).toBeFalsy();
    expect(fcm.fetchCollection).toHaveBeenCalledWith(
      options,
      expect.any(Function),
      undefined,
      undefined
    );
  });

  test("should handle empty collection", async () => {
    fcm.fetchCollection = vi.fn().mockImplementation(async (_, chunkLoaded) => {
      await chunkLoaded([]);
    });

    const result = await liveCollectionLoader(
      undefined,
      options,
      "superuser-token"
    );

    expect("error" in result).toBeFalsy();
    if ("entries" in result) {
      expect(result.entries).toHaveLength(0);
    }

    expect(plem.parseLiveEntry).not.toHaveBeenCalled();
  });

  test("should pass expand option to fetchCollection", async () => {
    const expandOptions = {
      ...options,
      experimental: {
        expand: "author,category"
      }
    };

    fcm.fetchCollection = vi.fn().mockImplementation(async (_, chunkLoaded) => {
      await chunkLoaded([]);
    });

    const result = await liveCollectionLoader(
      undefined,
      expandOptions,
      "superuser-token"
    );

    expect("error" in result).toBeFalsy();
    expect(fcm.fetchCollection).toHaveBeenCalledWith(
      expandOptions,
      expect.any(Function),
      "superuser-token",
      undefined
    );
  });

  describe("error handling", () => {
    test("should return error when fetchCollection throws", async () => {
      const error = new Error("Failed to fetch collection");
      fcm.fetchCollection = vi.fn().mockRejectedValue(error);

      const result = await liveCollectionLoader(
        undefined,
        options,
        "superuser-token"
      );

      expect("entries" in result).toBeFalsy();
      expect("error" in result).toBeTruthy();
      if ("error" in result) {
        expect(result.error).toEqual(error);
      }

      expect(plem.parseLiveEntry).not.toHaveBeenCalled();
    });
  });
});
