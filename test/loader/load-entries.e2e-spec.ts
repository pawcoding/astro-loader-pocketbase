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
  vi,
  type Mock
} from "vitest";
import { loadEntries } from "../../src/loader/load-entries";
import * as parseEntry from "../../src/loader/parse-entry";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";
import { getSuperuserToken } from "../../src/utils/get-superuser-token";
import { checkE2eConnection } from "../_mocks/check-e2e-connection";
import { createLoaderContext } from "../_mocks/create-loader-context";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { deleteCollection } from "../_mocks/delete-collection";
import { insertCollection } from "../_mocks/insert-collection";
import { insertEntries, insertEntry } from "../_mocks/insert-entry";

vi.mock("../../src/loader/parse-entry");

const DAY = 24 * 60 * 60 * 1000;

describe("loadEntries", () => {
  const options = createLoaderOptions({ collectionName: "_superusers" });
  let context: LoaderContext;
  let superuserToken: string;
  let parsedEntrySpy: Mock;

  beforeAll(async () => {
    await checkE2eConnection();
  });

  beforeEach(async () => {
    context = createLoaderContext();
    parsedEntrySpy = vi.spyOn(parseEntry, "parseEntry") as Mock;

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
    await loadEntries(options, context, superuserToken, undefined);

    expect(parsedEntrySpy).toHaveBeenCalledOnce();
  });

  test("should handle empty response gracefully", async () => {
    const testOptions = { ...options, collectionName: "users" };

    await loadEntries(testOptions, context, superuserToken, undefined);

    expect(parsedEntrySpy).not.toHaveBeenCalled();
  });

  test("should load all pages", async () => {
    const testOptions = {
      ...options,
      collectionName: randomUUID().replaceAll("-", "")
    };
    const numberOfEntries = 202;

    await insertCollection([], testOptions, superuserToken);
    await insertEntries(
      Array.from<Record<string, unknown>>({ length: numberOfEntries }).fill({}),
      testOptions,
      superuserToken
    );

    await loadEntries(testOptions, context, superuserToken, undefined);

    expect(parsedEntrySpy).toHaveBeenCalledTimes(numberOfEntries);

    await deleteCollection(testOptions, superuserToken);
  });

  test("should load filtered pages", async () => {
    const testOptions = {
      ...options,
      collectionName: randomUUID().replaceAll("-", ""),
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
    await loadEntries(testOptions, context, superuserToken, undefined);

    expect(parsedEntrySpy).toHaveBeenCalledTimes(numberOfEntries);

    await deleteCollection(testOptions, superuserToken);
  });

  test("should expand related fields in pages", async () => {
    const RELATION_FIELD_NAME = "related";
    const BLUE_ENTRY_NAME_FIELD_VALUE = "blue entry";

    const redCollectionOptions = {
      ...options,
      collectionName: `red_${randomUUID().replace(/-/g, "")}`
    };

    const blueCollectionOptions = {
      ...options,
      collectionName: `blue_${randomUUID().replace(/-/g, "")}`
    };

    const testOptions = {
      ...options,
      collectionName: redCollectionOptions.collectionName,
      expand: [RELATION_FIELD_NAME]
    };

    const blueCollection = await insertCollection(
      [
        {
          name: "name",
          type: "text"
        }
      ],
      blueCollectionOptions,
      superuserToken
    );

    await insertCollection(
      [
        {
          name: RELATION_FIELD_NAME,
          type: "relation",
          collectionId: blueCollection.id
        }
      ],
      redCollectionOptions,
      superuserToken
    );

    const blueEntry = await insertEntry(
      { name: BLUE_ENTRY_NAME_FIELD_VALUE },
      blueCollectionOptions,
      superuserToken
    );

    await insertEntry(
      { [RELATION_FIELD_NAME]: blueEntry.id },
      redCollectionOptions,
      superuserToken
    );

    await loadEntries(testOptions, context, superuserToken, undefined);

    const entryFromCall = parsedEntrySpy!.mock.calls[0][0];
    const relatedEntry = entryFromCall.expand?.related as PocketBaseEntry;

    // Ensure expand and related exist and are of expected type
    expect(relatedEntry?.name).toBe(BLUE_ENTRY_NAME_FIELD_VALUE);

    await deleteCollection(redCollectionOptions, superuserToken);
    await deleteCollection(blueCollectionOptions, superuserToken);
  });

  describe("incremental updates", () => {
    test("should fetch all entries when updatedField is missing", async () => {
      const lastModified = new Date(Date.now() - DAY).toISOString();
      await loadEntries(options, context, superuserToken, lastModified);

      expect(parsedEntrySpy).toHaveBeenCalledOnce();
    });

    test("should fetch updated entries", async () => {
      const testOptions = { ...options, updatedField: "updated" };
      const lastModified = new Date(Date.now() - DAY).toISOString();

      await loadEntries(testOptions, context, superuserToken, lastModified);

      expect(parsedEntrySpy).toHaveBeenCalledOnce();
    });

    test("should do nothing without updated entries", async () => {
      const testOptions = { ...options, updatedField: "updated" };
      const lastModified = new Date(Date.now() + DAY).toISOString();

      await loadEntries(testOptions, context, superuserToken, lastModified);

      expect(parsedEntrySpy).not.toHaveBeenCalled();
    });

    test("should not fetch updated entries excluded from filter", async () => {
      const testOptions = {
        ...options,
        updatedField: "updated",
        filter: "verified=false"
      };
      const lastModified = new Date(Date.now() - DAY).toISOString();

      await loadEntries(testOptions, context, superuserToken, lastModified);

      expect(parsedEntrySpy).not.toHaveBeenCalled();
    });
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
