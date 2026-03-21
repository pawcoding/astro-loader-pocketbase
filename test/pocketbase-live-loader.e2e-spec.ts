import { randomUUID } from "crypto";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  inject,
  it,
  test
} from "vitest";
import { pocketbaseLiveLoader } from "../src/pocketbase-loader";
import type { PocketBaseEntry } from "../src/types/pocketbase-entry.type";
import type {
  PocketBaseLiveLoaderOptions,
  PocketBaseLoaderOptions
} from "../src/types/pocketbase-loader-options.type";
import { createLiveLoaderOptions } from "./_mocks/create-live-loader-options";
import { deleteCollection } from "./_mocks/delete-collection";
import { insertCollection } from "./_mocks/insert-collection";
import { insertEntry } from "./_mocks/insert-entry";
import { fields, rawEntry } from "./_mocks/test-fields";
import { uploadFile } from "./_mocks/upload-file";

describe("pocketbaseLiveLoader", () => {
  const superuserToken = inject("superuserToken");
  let collectionName: string;
  let testOptions: PocketBaseLiveLoaderOptions;

  beforeAll(() => {
    collectionName = randomUUID().replaceAll("-", "");
    testOptions = createLiveLoaderOptions({ collectionName });
  });

  it("should return a valid loader", () => {
    const liveLoader = pocketbaseLiveLoader(testOptions);

    expect(liveLoader).toBeDefined();
    expect(liveLoader.name).toBe("pocketbase-live-loader");
    expect(typeof liveLoader.loadCollection).toBe("function");
    expect(typeof liveLoader.loadEntry).toBe("function");
  });

  describe("data loading", () => {
    let entry: PocketBaseEntry;

    beforeAll(async () => {
      await insertCollection(
        fields,
        testOptions as PocketBaseLoaderOptions,
        superuserToken
      );

      entry = await insertEntry(rawEntry, testOptions, superuserToken);
      entry = await uploadFile(entry.id, testOptions, superuserToken);
    });

    afterAll(async () => {
      await deleteCollection(testOptions, superuserToken);
    });

    test("loadCollection should return entries", async () => {
      const liveLoader = pocketbaseLiveLoader<PocketBaseEntry>(testOptions);

      const result = await liveLoader.loadCollection({
        collection: collectionName
      });

      expect("error" in result).toBeFalsy();

      // Only needed for TypeScript, runtime check is done by the previous expect
      if ("error" in result) {
        throw result.error;
      }

      expect(result.entries).toHaveLength(1);
      expect(result.entries.at(0)?.data).toMatchObject(entry);
    });

    test("loadEntry should return a single entry", async () => {
      const liveLoader = pocketbaseLiveLoader<PocketBaseEntry>(testOptions);

      const result = await liveLoader.loadEntry({
        filter: { id: entry.id },
        collection: collectionName
      });

      expect(result).toBeDefined();
      expect(result && "error" in result).toBeFalsy();

      // Only needed for TypeScript, runtime check is done by the previous expects
      if (!result || "error" in result) {
        throw (
          result?.error ||
          new Error("Expected a successful result but got undefined")
        );
      }

      expect(result.id).toBe(entry.id);
      expect(result.data).toMatchObject(entry);
    });
  });
});
