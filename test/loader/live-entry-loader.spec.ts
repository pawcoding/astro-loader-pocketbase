import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { liveEntryLoader } from "../../src/loader/live-entry-loader";
import { createLiveLoaderOptions } from "../_mocks/create-live-loader-options";
import { createPocketbaseEntry } from "../_mocks/create-pocketbase-entry";

vi.mock("../../src/loader/fetch-entry");
vi.mock("../../src/loader/parse-live-entry");

describe("liveEntryLoader", async () => {
  const options = createLiveLoaderOptions();
  const fem = await import("../../src/loader/fetch-entry");
  const plem = await import("../../src/loader/parse-live-entry");

  beforeEach(() => {
    plem.parseLiveEntry = vi.fn().mockImplementation((e) => e);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should return parsed entry", async () => {
    const entry = createPocketbaseEntry();
    fem.fetchEntry = vi.fn().mockResolvedValue(entry);

    const result = await liveEntryLoader(entry.id, options, "superuser-token");

    expect(fem.fetchEntry).toHaveBeenCalledWith(
      entry.id,
      options,
      "superuser-token"
    );
    expect(plem.parseLiveEntry).toHaveBeenCalledOnce();

    expect("error" in result).toBeFalsy();
    expect(result).toEqual(entry);
  });

  test("should work without token", async () => {
    const entry = createPocketbaseEntry();
    fem.fetchEntry = vi.fn().mockResolvedValue(entry);

    const result = await liveEntryLoader(entry.id, options, undefined);

    expect(fem.fetchEntry).toHaveBeenCalledWith(entry.id, options, undefined);
    expect(plem.parseLiveEntry).toHaveBeenCalledOnce();

    expect("error" in result).toBeFalsy();
    expect(result).toEqual(entry);
  });

  test("should pass expand option to fetchEntry", async () => {
    const entry = createPocketbaseEntry();
    const expandOptions = {
      ...options,
      experimental: {
        expand: "author,tags"
      }
    };

    fem.fetchEntry = vi.fn().mockResolvedValue(entry);

    const result = await liveEntryLoader(
      entry.id,
      expandOptions,
      "superuser-token"
    );

    expect(fem.fetchEntry).toHaveBeenCalledWith(
      entry.id,
      expandOptions,
      "superuser-token"
    );
    expect("error" in result).toBeFalsy();
  });

  describe("error handling", () => {
    test("should return error when fetchEntry throws", async () => {
      const error = new Error("Failed to fetch entry");
      fem.fetchEntry = vi.fn().mockRejectedValue(error);

      const result = await liveEntryLoader(
        "entry-id",
        options,
        "superuser-token"
      );

      expect("error" in result).toBeTruthy();
      if ("error" in result) {
        expect(result.error).toBe(error);
      }

      expect(plem.parseLiveEntry).not.toHaveBeenCalled();
    });
  });
});
