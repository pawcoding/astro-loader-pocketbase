import { beforeEach, describe, expect, test } from "vitest";
import { parseLiveEntry } from "../../src/loader/parse-live-entry";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";
import { createLiveLoaderOptions } from "../_mocks/create-live-loader-options";
import { createPocketbaseEntry } from "../_mocks/create-pocketbase-entry";

describe("parseLiveEntry", () => {
  let entry: PocketBaseEntry;

  beforeEach(() => {
    entry = createPocketbaseEntry({
      id: "test-entry-123",
      title: "Test Title",
      content: "Test content here",
      description: "Test description",
      updated: "2023-12-01T10:00:00Z"
    });
  });

  describe("entry and content", () => {
    test("should parse entry without content fields", () => {
      const options = createLiveLoaderOptions();

      const result = parseLiveEntry(entry, options);

      expect(result).toMatchObject({
        id: entry.id,
        data: entry
      });
    });

    test("should parse entry with single content field", () => {
      const options = createLiveLoaderOptions({
        contentFields: "title"
      });

      const result = parseLiveEntry(entry, options);

      expect(result).toMatchObject({
        id: entry.id,
        data: entry,
        rendered: {
          html: entry.title
        }
      });
    });

    test("should parse entry with multiple content fields", () => {
      const options = createLiveLoaderOptions({
        contentFields: ["title", "content"]
      });

      const result = parseLiveEntry(entry, options);

      expect(result).toMatchObject({
        id: entry.id,
        data: entry,
        rendered: {
          html: `<section id="title">${entry.title}</section><section id="content">${entry.content}</section>`
        }
      });
    });
  });

  describe("cache hints", () => {
    test("should include tags cache hint", () => {
      const options = createLiveLoaderOptions({
        collectionName: "posts"
      });

      const result = parseLiveEntry(entry, options);

      expect(result).toMatchObject({
        cacheHint: {
          tags: ["posts-test-entry-123"],
          lastModified: undefined
        }
      });
    });

    test("should include lastModified cache hint when updatedField is provided", () => {
      const options = createLiveLoaderOptions({
        updatedField: "updated"
      });

      const result = parseLiveEntry(entry, options);

      expect(result).toMatchObject({
        cacheHint: {
          lastModified: new Date(entry.updated as string)
        }
      });
    });

    test("should not include lastModified cache hint when entry is missing updated field", () => {
      const entryWithoutUpdated = createPocketbaseEntry({
        id: "test-entry-no-updated"
      });

      const options = createLiveLoaderOptions({
        updatedField: "nonexistent_field"
      });

      const result = parseLiveEntry(entryWithoutUpdated, options);

      expect(result).toMatchObject({
        cacheHint: {
          lastModified: undefined
        }
      });
    });

    test("should not include lastModified cache hint when entry has invalid updated field", () => {
      const entryWithInvalidDate = createPocketbaseEntry({
        id: "test-entry-invalid-date",
        updated: "invalid-date"
      });

      const options = createLiveLoaderOptions({
        updatedField: "updated"
      });

      const result = parseLiveEntry(entryWithInvalidDate, options);

      expect(result).toMatchObject({
        cacheHint: {
          lastModified: undefined
        }
      });
    });
  });
});
