import {
  LiveCollectionError,
  LiveEntryNotFoundError
} from "astro/content/runtime";
import { randomUUID } from "crypto";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  inject,
  test,
  vi
} from "vitest";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../../src";
import { fetchCollection } from "../../src/loader/fetch-collection";
import { PocketBaseAuthenticationError } from "../../src/types/errors";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { deleteCollection } from "../_mocks/delete-collection";
import { insertCollection } from "../_mocks/insert-collection";
import { insertEntries, insertEntry } from "../_mocks/insert-entry";

const DAY = 24 * 60 * 60 * 1000;

describe("fetchCollection", () => {
  const options = createLoaderOptions({ collectionName: "_superusers" });
  const superuserToken = inject("superuserToken");
  let chunkLoadedMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    chunkLoadedMock = vi.fn().mockResolvedValue(undefined);
  });

  test("should fetch entries without errors", async () => {
    await fetchCollection(options, chunkLoadedMock, superuserToken, undefined);

    expect(chunkLoadedMock).toHaveBeenCalledOnce();
  });

  test("should handle empty response gracefully", async () => {
    const testOptions = {
      ...options,
      collectionName: randomUUID().replaceAll("-", "")
    };

    await insertCollection([], testOptions, superuserToken);

    await fetchCollection(
      testOptions,
      chunkLoadedMock,
      superuserToken,
      undefined
    );

    expect(chunkLoadedMock).toHaveBeenCalledWith([]);
  });

  test("should load all pages", async () => {
    const testOptions = {
      ...options,
      collectionName: randomUUID().replaceAll("-", "")
    };
    const numberOfEntries = 202;
    let totalEntries = 0;

    await insertCollection([], testOptions, superuserToken);
    await insertEntries(
      Array.from<Record<string, unknown>>({ length: numberOfEntries }).fill({}),
      testOptions,
      superuserToken
    );

    await fetchCollection(
      testOptions,
      async (entries) => {
        totalEntries += entries.length;
      },
      superuserToken,
      undefined
    );

    expect(totalEntries).toBe(numberOfEntries);

    await deleteCollection(testOptions, superuserToken);
  });

  test("should load filtered pages", async () => {
    const testOptions = {
      ...options,
      collectionName: randomUUID().replaceAll("-", ""),
      filter: "value=true"
    };
    const numberOfEntries = 101;
    let totalEntries = 0;

    await insertCollection(
      [
        {
          name: "value",
          type: "bool"
        }
      ],
      testOptions,
      superuserToken
    );
    await insertEntries(
      Array.from<Record<string, unknown>>({ length: numberOfEntries }).fill({
        value: true
      }),
      testOptions,
      superuserToken
    );
    await insertEntries(
      Array.from<Record<string, unknown>>({ length: numberOfEntries }).fill({
        value: false
      }),
      testOptions,
      superuserToken
    );

    await fetchCollection(
      testOptions,
      async (entries) => {
        totalEntries += entries.length;
      },
      superuserToken,
      undefined
    );

    expect(totalEntries).toBe(numberOfEntries);

    await deleteCollection(testOptions, superuserToken);
  });

  describe("incremental updates", () => {
    test("should fetch all entries when updatedField is missing", async () => {
      const lastModified = new Date(Date.now() - DAY).toISOString();
      await fetchCollection(options, chunkLoadedMock, superuserToken, {
        lastModified
      });

      expect(chunkLoadedMock).toHaveBeenCalledOnce();
    });

    test("should fetch updated entries", async () => {
      const testOptions = { ...options, updatedField: "updated" };
      const lastModified = new Date(Date.now() - DAY).toISOString();

      await fetchCollection(testOptions, chunkLoadedMock, superuserToken, {
        lastModified
      });

      expect(chunkLoadedMock).toHaveBeenCalledOnce();
    });

    test("should do nothing without updated entries", async () => {
      const testOptions = { ...options, updatedField: "updated" };
      const lastModified = new Date(Date.now() + DAY).toISOString();

      await fetchCollection(testOptions, chunkLoadedMock, superuserToken, {
        lastModified
      });

      expect(chunkLoadedMock).toHaveBeenCalledWith([]);
    });

    test("should not fetch updated entries excluded from filter", async () => {
      const testOptions = {
        ...options,
        updatedField: "updated",
        filter: "verified=false"
      };
      const lastModified = new Date(Date.now() - DAY).toISOString();

      await fetchCollection(testOptions, chunkLoadedMock, superuserToken, {
        lastModified
      });

      expect(chunkLoadedMock).toHaveBeenCalledWith([]);
    });
  });

  describe("error handling", () => {
    test("should throw error if collection is not accessible without superuser rights", async () => {
      const promise = fetchCollection(
        options,
        chunkLoadedMock,
        undefined,
        undefined
      );

      await expect(promise).rejects.toThrow(PocketBaseAuthenticationError);
    });

    test("should throw error if collection is missing", async () => {
      const invalidOptions = {
        ...options,
        collectionName: "invalidCollection"
      };

      const promise = fetchCollection(
        invalidOptions,
        chunkLoadedMock,
        superuserToken,
        undefined
      );

      await expect(promise).rejects.toThrow(LiveEntryNotFoundError);
    });

    test("should throw error invalid filter", async () => {
      const invalidOptions = {
        ...options,
        filter: "invalidFilter>0"
      };

      const promise = fetchCollection(
        invalidOptions,
        chunkLoadedMock,
        superuserToken,
        undefined
      );

      await expect(promise).rejects.toThrow(LiveCollectionError);
    });
  });

  describe("collection filter options", () => {
    test("should handle page and perPage options", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", "")
      };
      const numberOfEntries = 150;

      await insertCollection([], testOptions, superuserToken);
      await insertEntries(
        Array.from<Record<string, unknown>>({ length: numberOfEntries }).fill(
          {}
        ),
        testOptions,
        superuserToken
      );

      await fetchCollection(testOptions, chunkLoadedMock, superuserToken, {
        page: 1,
        perPage: 50
      });

      expect(chunkLoadedMock).toHaveBeenCalledOnce();
      const entries = chunkLoadedMock.mock.calls[0][0];
      expect(entries).toHaveLength(50);

      await deleteCollection(testOptions, superuserToken);
    });

    test("should handle additional filter", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", ""),
        filter: "value=true"
      };
      const numberOfEntries = 50;
      let totalEntries = 0;

      await insertCollection(
        [
          {
            name: "value",
            type: "bool"
          },
          {
            name: "category",
            type: "text"
          }
        ],
        testOptions,
        superuserToken
      );

      await insertEntries(
        Array.from<Record<string, unknown>>({ length: numberOfEntries }).fill({
          value: true,
          category: "test"
        }),
        testOptions,
        superuserToken
      );

      await insertEntries(
        Array.from<Record<string, unknown>>({ length: numberOfEntries }).fill({
          value: true,
          category: "other"
        }),
        testOptions,
        superuserToken
      );

      await fetchCollection(
        testOptions,
        async (entries) => {
          totalEntries += entries.length;
        },
        superuserToken,
        { filter: 'category="test"' }
      );

      expect(totalEntries).toBe(numberOfEntries);

      await deleteCollection(testOptions, superuserToken);
    });

    test("should handle custom sort", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", "")
      };

      await insertCollection(
        [
          {
            name: "title",
            type: "text"
          }
        ],
        testOptions,
        superuserToken
      );

      await insertEntries(
        [{ title: "Z Title" }, { title: "A Title" }, { title: "M Title" }],
        testOptions,
        superuserToken
      );

      const results: Array<PocketBaseEntry> = [];
      await fetchCollection(
        testOptions,
        async (entries) => {
          results.push(...entries);
        },
        superuserToken,
        {
          sort: "title"
        }
      );

      expect(results[0].title).toBe("A Title");
      expect(results[1].title).toBe("M Title");
      expect(results[2].title).toBe("Z Title");

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
          {
            name: "title",
            type: "text"
          },
          {
            name: "content",
            type: "text"
          },
          {
            name: "description",
            type: "text"
          }
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

      const results: Array<PocketBaseEntry> = [];
      await fetchCollection(
        testOptions,
        async (entries) => {
          results.push(...entries);
        },
        superuserToken,
        undefined
      );

      expect(results).toHaveLength(1);

      // Description should not be included
      delete entry["description"];
      expect(results[0]).toMatchObject(entry);

      await deleteCollection(testOptions, superuserToken);
    });

    test("should include all fields when no fields option is provided", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", "")
      };

      await insertCollection(
        [
          {
            name: "title",
            type: "text"
          },
          {
            name: "content",
            type: "text"
          }
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

      const results: Array<PocketBaseEntry> = [];
      await fetchCollection(
        testOptions,
        async (entries) => {
          results.push(...entries);
        },
        superuserToken,
        undefined
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(entry);

      await deleteCollection(testOptions, superuserToken);
    });

    test("should include all fields when '*' wildcard is used", async () => {
      const testOptions = {
        ...options,
        collectionName: randomUUID().replaceAll("-", ""),
        fields: "*"
      };

      await insertCollection(
        [
          {
            name: "title",
            type: "text"
          },
          {
            name: "content",
            type: "text"
          }
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

      const results: Array<PocketBaseEntry> = [];
      await fetchCollection(
        testOptions,
        async (entries) => {
          results.push(...entries);
        },
        superuserToken,
        undefined
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(entry);

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

      const result: Array<Record<string, any>> = [];
      await fetchCollection(
        testOptions,
        async (e) => {
          result.push(...e);
        },
        superuserToken,
        undefined
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(entry.id);
      expect(result[0].expand.singleRelation.id).toBe(relationEntry.id);
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

      const result: Array<Record<string, any>> = [];
      await fetchCollection(
        { ...testOptions, experimental: { expand: ["multiRelation"] } },
        async (e) => {
          result.push(...e);
        },
        superuserToken,
        undefined
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(entry.id);

      const multiRelation = (
        result[0].expand as { multiRelation: Array<{ id: string }> }
      ).multiRelation;
      expect(multiRelation).toBeInstanceOf(Array);
      expect(multiRelation).toHaveLength(2);
      expect(multiRelation.map((entry) => entry.id)).toEqual(relationIds);
    });
  });
});
