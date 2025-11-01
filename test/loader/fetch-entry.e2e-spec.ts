import { LiveEntryNotFoundError } from "astro/content/runtime";
import { randomUUID } from "crypto";
import { afterEach, beforeEach, describe, expect, inject, test } from "vitest";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../../src";
import { fetchEntry } from "../../src/loader/fetch-entry";
import { PocketBaseAuthenticationError } from "../../src/types/errors";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { deleteCollection } from "../_mocks/delete-collection";
import { insertCollection } from "../_mocks/insert-collection";
import { insertEntries, insertEntry } from "../_mocks/insert-entry";

describe("fetchEntry", () => {
  const options = createLoaderOptions({ collectionName: "_superusers" });
  const superuserToken = inject("superuserToken");

  test("should fetch entry without errors", async () => {
    const testOptions = {
      ...options,
      collectionName: randomUUID().replaceAll("-", "")
    };

    await insertCollection(
      [{ name: "title", type: "text" }],
      testOptions,
      superuserToken
    );
    const entryData = { title: "Test Entry" };
    const insertedEntry = await insertEntry(
      entryData,
      testOptions,
      superuserToken
    );

    const entry = await fetchEntry(
      insertedEntry.id,
      testOptions,
      superuserToken
    );

    expect(entry.id).toBe(insertedEntry.id);
    expect(entry.title).toBe(entryData.title);

    await deleteCollection(testOptions, superuserToken);
  });

  describe("error handling", () => {
    test("should throw error if entry is not accessible without superuser rights", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", "")
      };

      await insertCollection(
        [{ name: "title", type: "text" }],
        testOptions,
        superuserToken
      );
      const entryData = { title: "Test Entry" };
      const insertedEntry = await insertEntry(
        entryData,
        testOptions,
        superuserToken
      );

      const promise = fetchEntry(insertedEntry.id, testOptions, undefined);

      await expect(promise).rejects.toThrow(PocketBaseAuthenticationError);

      await deleteCollection(testOptions, superuserToken);
    });

    test("should throw error if entry does not exist", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", "")
      };

      await insertCollection(
        [{ name: "title", type: "text" }],
        testOptions,
        superuserToken
      );

      const promise = fetchEntry("nonexistent123", testOptions, superuserToken);

      await expect(promise).rejects.toThrow(LiveEntryNotFoundError);

      await deleteCollection(testOptions, superuserToken);
    });

    test("should throw error if collection does not exist", async () => {
      const invalidOptions = {
        ...options,
        collectionName: "invalidCollection"
      };

      const promise = fetchEntry("any-id", invalidOptions, superuserToken);

      await expect(promise).rejects.toThrow(LiveEntryNotFoundError);
    });

    test("should handle invalid impersonate token", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", ""),
        superuserCredentials: {
          impersonateToken: "invalid-token"
        }
      };

      await insertCollection(
        [{ name: "title", type: "text" }],
        testOptions,
        superuserToken
      );
      const entryData = { title: "Test Entry" };
      const insertedEntry = await insertEntry(
        entryData,
        testOptions,
        superuserToken
      );

      const promise = fetchEntry(insertedEntry.id, testOptions, undefined);

      await expect(promise).rejects.toThrow(PocketBaseAuthenticationError);

      await deleteCollection(testOptions, superuserToken);
    });
  });

  describe("fields filtering", () => {
    test("should include fields parameter in request when fields option is provided", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", ""),
        fields: ["title", "content"]
      };

      await insertCollection(
        [
          { name: "title", type: "text" },
          { name: "content", type: "text" },
          { name: "description", type: "text" }
        ],
        testOptions,
        superuserToken
      );

      const entry = await insertEntry(
        {
          title: "Test Title",
          content: "Test Content",
          description: "Test Description"
        },
        testOptions,
        superuserToken
      );

      const result = await fetchEntry(entry.id, testOptions, superuserToken);

      // Description should not be included
      delete entry["description"];
      expect(result).toEqual(entry);

      await deleteCollection(testOptions, superuserToken);
    });

    test("should include all fields when no fields option is provided", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", "")
      };

      await insertCollection(
        [
          { name: "title", type: "text" },
          { name: "content", type: "text" }
        ],
        testOptions,
        superuserToken
      );

      const entry = await insertEntry(
        {
          title: "Test Title",
          content: "Test Content"
        },
        testOptions,
        superuserToken
      );

      const result = await fetchEntry(entry.id, testOptions, superuserToken);

      expect(result).toEqual(entry);

      await deleteCollection(testOptions, superuserToken);
    });
  });

  describe("expand parameter", () => {
    let testOptions: ExperimentalPocketBaseLiveLoaderOptions;
    let relationOptions: ExperimentalPocketBaseLiveLoaderOptions;
    let relationCollectionId: string;

    beforeEach(async () => {
      testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", ""),
        experimental: {
          expand: ["singleRelation"]
        }
      };
      relationOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", ""),
        experimental: {}
      };

      relationCollectionId = await insertCollection(
        [],
        relationOptions,
        superuserToken
      );
    });

    afterEach(async () => {
      await deleteCollection(testOptions, superuserToken);
      await deleteCollection(relationOptions, superuserToken);
    });

    test("should expand single relation", async () => {
      await insertCollection(
        [
          {
            type: "relation",
            name: "singleRelation",
            collectionId: relationCollectionId,
            maxSelect: 1
          }
        ],
        testOptions,
        superuserToken
      );

      const relationEntry = await insertEntry(
        {},
        relationOptions,
        superuserToken
      );
      const entry = await insertEntry(
        {
          singleRelation: relationEntry.id
        },
        testOptions,
        superuserToken
      );

      const result = await fetchEntry(entry.id, testOptions, superuserToken);

      expect(result).toBeDefined();
      expect(result.expand).toBeDefined();
      expect((result.expand as any).singleRelation.id).toBe(relationEntry.id);
    });

    test("should expand multi relation", async () => {
      await insertCollection(
        [
          {
            type: "relation",
            name: "multiRelation",
            collectionId: relationCollectionId,
            maxSelect: 2
          }
        ],
        testOptions,
        superuserToken
      );

      const relationEntries = await insertEntries(
        [{}, {}],
        relationOptions,
        superuserToken
      );
      const relationIds = relationEntries.map((entry) => entry.id);
      const entry = await insertEntry(
        {
          multiRelation: relationIds
        },
        testOptions,
        superuserToken
      );

      const result = await fetchEntry(
        entry.id,
        { ...testOptions, experimental: { expand: ["multiRelation"] } },
        superuserToken
      );

      expect(result).toBeDefined();
      expect(result.expand).toBeDefined();

      const multiRelation = (
        result.expand as { multiRelation: Array<{ id: string }> }
      ).multiRelation;
      expect(multiRelation).toBeInstanceOf(Array);
      expect(multiRelation).toHaveLength(2);
      expect(multiRelation.map((entry) => entry.id)).toEqual(relationIds);
    });
  });
});
