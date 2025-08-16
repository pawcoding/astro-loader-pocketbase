import { randomUUID } from "crypto";
import {
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi
} from "vitest";
import { fetchCollection } from "../../src/loader/fetch-collection";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";
import { getSuperuserToken } from "../../src/utils/get-superuser-token";
import { checkE2eConnection } from "../_mocks/check-e2e-connection";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { deleteCollection } from "../_mocks/delete-collection";
import { insertCollection } from "../_mocks/insert-collection";
import { insertEntries } from "../_mocks/insert-entry";

const DAY = 24 * 60 * 60 * 1000;

describe("fetchCollection", () => {
  const options = createLoaderOptions({ collectionName: "_superusers" });
  let superuserToken: string;
  let chunkLoadedMock: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    await checkE2eConnection();
  });

  beforeEach(async () => {
    chunkLoadedMock = vi.fn().mockResolvedValue(undefined);

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

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should fetch entries without errors", async () => {
    await fetchCollection(options, chunkLoadedMock, superuserToken, undefined);

    expect(chunkLoadedMock).toHaveBeenCalledOnce();
  });

  test("should handle empty response gracefully", async () => {
    const testOptions = { ...options, collectionName: "users" };

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
      // oxlint-disable-next-line require-await
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
      // oxlint-disable-next-line require-await
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

      await expect(promise).rejects.toThrow();
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

      await expect(promise).rejects.toThrow();
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

      await expect(promise).rejects.toThrow();
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
        // oxlint-disable-next-line require-await
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
        // oxlint-disable-next-line require-await
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
});
