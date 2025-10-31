import { randomUUID } from "crypto";
import { assert, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { fetchEntry } from "../../src/loader/fetch-entry";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";
import { getSuperuserToken } from "../../src/utils/get-superuser-token";
import { checkE2eConnection } from "../_mocks/check-e2e-connection";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { deleteCollection } from "../_mocks/delete-collection";
import { insertCollection } from "../_mocks/insert-collection";
import { insertEntry } from "../_mocks/insert-entry";

describe("fetchEntry", () => {
  const options = createLoaderOptions({ collectionName: "_superusers" });
  let superuserToken: string;

  beforeAll(async () => {
    await checkE2eConnection();
  });

  beforeEach(async () => {
    assert(options.superuserCredentials, "Superuser credentials are not set.");
    assert(
      !("impersonateToken" in options.superuserCredentials),
      "Impersonate token should not be used in tests."
    );

    const token = await getSuperuserToken(
      options.url,
      options.superuserCredentials
    );

    assert(token, "Superuser token is not available.");
    superuserToken = token;
  });

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

    const entry = await fetchEntry<PocketBaseEntry>(
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

      const promise = fetchEntry<PocketBaseEntry>(
        insertedEntry.id,
        testOptions,
        undefined
      );

      await expect(promise).rejects.toThrow(
        "not accessible without superuser rights"
      );

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

      const promise = fetchEntry<PocketBaseEntry>(
        "nonexistent123",
        testOptions,
        superuserToken
      );

      await expect(promise).rejects.toThrow('Fetching entry "nonexistent123"');

      await deleteCollection(testOptions, superuserToken);
    });

    test("should throw error if collection does not exist", async () => {
      const invalidOptions = {
        ...options,
        collectionName: "invalidCollection"
      };

      const promise = fetchEntry<PocketBaseEntry>(
        "any-id",
        invalidOptions,
        superuserToken
      );

      await expect(promise).rejects.toThrow();
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

      const promise = fetchEntry<PocketBaseEntry>(
        insertedEntry.id,
        testOptions,
        undefined
      );

      await expect(promise).rejects.toThrow(
        "The given impersonate token is not valid"
      );

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

      const result = await fetchEntry<PocketBaseEntry>(
        entry.id,
        testOptions,
        superuserToken
      );

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

      const result = await fetchEntry<PocketBaseEntry>(
        entry.id,
        testOptions,
        superuserToken
      );

      expect(result).toEqual(entry);

      await deleteCollection(testOptions, superuserToken);
    });
  });

  describe("expand option", () => {
    test("should handle expand option in request", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", "")
      };

      await insertCollection(
        [{ name: "title", type: "text" }],
        testOptions,
        superuserToken
      );

      const entry = await insertEntry(
        { title: "Test Entry" },
        testOptions,
        superuserToken
      );

      // Use expand option (even though this collection has no relations)
      const expandOptions = {
        ...testOptions,
        experimental: {
          expand: "someField"
        }
      };

      const result = await fetchEntry<PocketBaseEntry>(
        entry.id,
        expandOptions,
        superuserToken
      );

      // Verify the entry is fetched successfully with expand parameter
      expect(result.id).toBe(entry.id);
      expect(result.title).toBe("Test Entry");

      await deleteCollection(testOptions, superuserToken);
    });

    test("should not throw error for invalid expand parameter (PocketBase silently ignores it)", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", "")
      };

      await insertCollection(
        [{ name: "title", type: "text" }],
        testOptions,
        superuserToken
      );

      const entry = await insertEntry(
        { title: "Test" },
        testOptions,
        superuserToken
      );

      const expandOptions = {
        ...testOptions,
        experimental: {
          expand: "nonExistentField"
        }
      };

      const result = await fetchEntry<PocketBaseEntry>(
        entry.id,
        expandOptions,
        superuserToken
      );

      // PocketBase doesn't throw an error for invalid expand, it just ignores it
      expect(result).toBeDefined();
      expect(result.id).toBe(entry.id);

      await deleteCollection(testOptions, superuserToken);
    });
  });
});
