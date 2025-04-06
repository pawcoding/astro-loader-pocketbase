import type { LoaderContext } from "astro/loaders";
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
import { loadEntries } from "../../src/loader/load-entries";
import { parseEntry } from "../../src/loader/parse-entry";
import { getSuperuserToken } from "../../src/utils/get-superuser-token";
import { checkE2eConnection } from "../_mocks/check-e2e-connection";
import { createLoaderContext } from "../_mocks/create-loader-context";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { deleteCollection } from "../_mocks/delete-collection";
import { insertCollection } from "../_mocks/insert-collection";
import { insertEntries } from "../_mocks/insert-entry";

vi.mock("../../src/loader/parse-entry");

const DAY = 24 * 60 * 60 * 1000;

describe("loadEntries", () => {
  const options = createLoaderOptions({ collectionName: "_superusers" });
  let context: LoaderContext;
  let superuserToken: string;

  beforeAll(async () => {
    await checkE2eConnection();
  });

  beforeEach(async () => {
    context = createLoaderContext();

    const token = await getSuperuserToken(
      options.url,
      options.superuserCredentials!
    );

    assert(token, "Superuser token is not available.");
    superuserToken = token;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should fetch entries without errors", async () => {
    await loadEntries(options, context, superuserToken, undefined);

    expect(parseEntry).toHaveBeenCalledOnce();
  });

  test("should handle empty response gracefully", async () => {
    const testOptions = { ...options, collectionName: "users" };

    await loadEntries(testOptions, context, superuserToken, undefined);

    expect(parseEntry).not.toHaveBeenCalled();
  });

  test("should load all pages", async () => {
    const testOptions = {
      ...options,
      collectionName: randomUUID().replace(/-/g, "")
    };
    const numberOfEntries = 202;

    await insertCollection([], testOptions, superuserToken);
    await insertEntries(
      new Array(numberOfEntries).fill({}),
      testOptions,
      superuserToken
    );

    await loadEntries(testOptions, context, superuserToken, undefined);

    expect(parseEntry).toHaveBeenCalledTimes(numberOfEntries);

    await deleteCollection(testOptions, superuserToken);
  });

  describe("incremental updates", () => {
    test("should fetch all entries when updatedField is missing", async () => {
      const lastModified = new Date(Date.now() - DAY).toISOString();
      await loadEntries(options, context, superuserToken, lastModified);

      expect(parseEntry).toHaveBeenCalledOnce();
    });

    test("should fetch updated entries", async () => {
      const testOptions = { ...options, updatedField: "updated" };
      const lastModified = new Date(Date.now() - DAY).toISOString();

      await loadEntries(testOptions, context, superuserToken, lastModified);

      expect(parseEntry).toHaveBeenCalledOnce();
    });

    test("should do nothing without updated entries", async () => {
      const testOptions = { ...options, updatedField: "updated" };
      const lastModified = new Date(Date.now() + DAY).toISOString();

      await loadEntries(testOptions, context, superuserToken, lastModified);

      expect(parseEntry).not.toHaveBeenCalled();
    });

    test("should not fetch updated entries excluded from filter", async () => {
      const testOptions = {
        ...options,
        updatedField: "updated",
        filter: "verified=false"
      };
      const lastModified = new Date(Date.now() - DAY).toISOString();

      await loadEntries(testOptions, context, superuserToken, lastModified);

      expect(parseEntry).not.toHaveBeenCalled();
    });
  });

  test("should load filtered pages", async () => {
    const testOptions = {
      ...options,
      collectionName: randomUUID().replace(/-/g, ""),
      filter: "value=true"
    };
    const numberOfEntries = 101;

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
      new Array(numberOfEntries).fill({ value: true }),
      testOptions,
      superuserToken
    );
    await insertEntries(
      new Array(numberOfEntries).fill({ value: false }),
      testOptions,
      superuserToken
    );
    await loadEntries(testOptions, context, superuserToken, undefined);

    expect(parseEntry).toHaveBeenCalledTimes(numberOfEntries);

    await deleteCollection(testOptions, superuserToken);
  });

  describe("error handling", () => {
    test("should throw error if collection is not accessible without superuser rights", async () => {
      const promise = loadEntries(options, context, undefined, undefined);

      await expect(promise).rejects.toThrow();
    });

    test("should throw error if collection is missing", async () => {
      const invalidOptions = {
        ...options,
        collectionName: "invalidCollection"
      };

      const promise = loadEntries(
        invalidOptions,
        context,
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

      const promise = loadEntries(
        invalidOptions,
        context,
        superuserToken,
        undefined
      );

      await expect(promise).rejects.toThrow();
    });
  });
});
