import { randomUUID } from "crypto";
import { LiveEntryNotFoundError } from "astro/content/runtime";
import { afterAll, beforeAll, describe, expect, inject, test } from "vitest";
import { fetchEntry } from "../../src/loader/fetch-entry";
import { PocketBaseAuthenticationError } from "../../src/types/errors";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";
import type { PocketBaseLoaderOptions } from "../../src/types/pocketbase-loader-options.type";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { deleteCollection } from "../_mocks/delete-collection";
import { insertCollection } from "../_mocks/insert-collection";
import { insertEntry } from "../_mocks/insert-entry";

describe("fetchEntry", () => {
  const superuserToken = inject("superuserToken");
  let options: PocketBaseLoaderOptions;
  let originalEntry: PocketBaseEntry;

  beforeAll(async () => {
    const collectionName = randomUUID().replaceAll("-", "");
    options = createLoaderOptions({ collectionName });

    await insertCollection(
      [
        { name: "title", type: "text" },
        { name: "content", type: "text" },
        { name: "description", type: "text" }
      ],
      options,
      superuserToken
    );

    originalEntry = await insertEntry(
      {
        title: "Test Title",
        content: "Test Content",
        description: "Test Description"
      },
      options,
      superuserToken
    );
  });

  afterAll(async () => {
    await deleteCollection(options, superuserToken);
  });

  test("should fetch entry without errors", async () => {
    const result = await fetchEntry(originalEntry.id, options, superuserToken);

    expect(result).toEqual(originalEntry);
  });

  describe("error handling", () => {
    test("should throw error if entry is not accessible without superuser rights", async () => {
      const promise = fetchEntry(originalEntry.id, options, undefined);

      await expect(promise).rejects.toThrow(PocketBaseAuthenticationError);
    });

    test("should throw error if entry does not exist", async () => {
      const promise = fetchEntry("nonexistent123", options, superuserToken);

      await expect(promise).rejects.toThrow(LiveEntryNotFoundError);
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
        superuserCredentials: {
          impersonateToken: "invalid-token"
        }
      };

      const promise = fetchEntry(originalEntry.id, testOptions, undefined);

      await expect(promise).rejects.toThrow(PocketBaseAuthenticationError);
    });
  });

  describe("fields filtering", () => {
    test("should include fields parameter in request when fields array option is provided", async () => {
      const testOptions = {
        ...options,
        fields: ["title", "content"]
      };

      const testEntry = structuredClone(originalEntry);

      const result = await fetchEntry(
        testEntry.id,
        testOptions,
        superuserToken
      );

      // Description should not be included
      delete testEntry.description;
      expect(result).toEqual(testEntry);
    });

    test("should include fields parameter in request when fields string option is provided", async () => {
      const testOptions = {
        ...options,
        fields: "title,content"
      };

      const testEntry = structuredClone(originalEntry);

      const result = await fetchEntry(
        testEntry.id,
        testOptions,
        superuserToken
      );

      // Description should not be included
      delete testEntry.description;
      expect(result).toEqual(testEntry);
    });

    test("should include all fields when * option is provided", async () => {
      const testOptions = {
        ...options,
        fields: "*"
      };

      const result = await fetchEntry(
        originalEntry.id,
        testOptions,
        superuserToken
      );

      expect(result).toEqual(originalEntry);
    });
  });
});
