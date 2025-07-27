import type { LoaderContext } from "astro/loaders";
import { randomUUID } from "crypto";
import {
  assert,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi
} from "vitest";
import { cleanupEntries } from "../../src/loader/cleanup-entries";
import { getSuperuserToken } from "../../src/utils/get-superuser-token";
import { checkE2eConnection } from "../_mocks/check-e2e-connection";
import { createLoaderContext } from "../_mocks/create-loader-context";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { createPocketbaseEntry } from "../_mocks/create-pocketbase-entry";
import { deleteCollection } from "../_mocks/delete-collection";
import { deleteEntry } from "../_mocks/delete-entry";
import { insertCollection } from "../_mocks/insert-collection";
import { insertEntries, insertEntry } from "../_mocks/insert-entry";

describe("cleanupEntries", () => {
  const options = createLoaderOptions({ collectionName: "users" });
  let context: LoaderContext;
  let superuserToken: string;

  beforeAll(async () => {
    await checkE2eConnection();
  });

  beforeEach(async () => {
    context = createLoaderContext();

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

  test("should log error if collection is not accessible without superuser rights", async () => {
    const storeClearSpy = vi.spyOn(context.store, "clear");

    await cleanupEntries(
      { ...options, collectionName: "_superusers" },
      context,
      undefined
    );

    expect(context.logger.error).toHaveBeenCalledOnce();
    expect(storeClearSpy).toHaveBeenCalledOnce();
  });

  test("should log error if collection doesn't exist", async () => {
    const storeClearSpy = vi.spyOn(context.store, "clear");
    const storeDeleteSpy = vi.spyOn(context.store, "delete");
    const storeValuesSpy = vi.spyOn(context.store, "values");

    await cleanupEntries(
      { ...options, collectionName: "nonExistent" },
      context,
      superuserToken
    );

    expect(context.logger.error).toHaveBeenCalledOnce();
    expect(storeClearSpy).toHaveBeenCalledOnce();
    expect(storeDeleteSpy).not.toHaveBeenCalled();
    expect(storeValuesSpy).not.toHaveBeenCalled();
  });

  test("should cleanup old entries", async () => {
    const entry = createPocketbaseEntry();
    context.store.set({ id: entry.id, data: entry });

    await cleanupEntries(options, context, superuserToken);

    expect(context.logger.error).not.toHaveBeenCalled();
    expect(context.store.has(entry.id)).toBeFalsy();
    expect(context.store.keys()).toHaveLength(0);
  });

  test("should cleanup filtered entries", async () => {
    const testOptions = {
      ...options,
      collectionName: randomUUID().replaceAll("-", ""),
      filter: "visible=true"
    };

    await insertCollection(
      [
        {
          name: "visible",
          type: "bool"
        }
      ],
      testOptions,
      superuserToken
    );

    const [visibleEntry, hiddenEntry] = await insertEntries(
      [
        {
          visible: true
        },
        {
          visible: false
        }
      ],
      testOptions,
      superuserToken
    );

    context.store.set({ id: visibleEntry.id, data: visibleEntry });
    context.store.set({ id: hiddenEntry.id, data: hiddenEntry });

    await cleanupEntries(testOptions, context, superuserToken);

    expect(context.store.keys()).toHaveLength(1);
    expect(context.store.has(visibleEntry.id)).toBeTruthy();
    expect(context.store.has(hiddenEntry.id)).toBeFalsy();

    await deleteCollection(testOptions, superuserToken);
  });

  // https://github.com/pawcoding/astro-loader-pocketbase/issues/46
  test("should cleanup entries with custom ID field", async () => {
    const testOptions = {
      ...options,
      collectionName: randomUUID().replace(/-/g, ""),
      idField: "slug"
    };

    await insertCollection(
      [
        {
          name: "slug",
          type: "text"
        }
      ],
      testOptions,
      superuserToken
    );

    const [entry1, entry2] = await insertEntries(
      [
        {
          slug: "entry-1"
        },
        {
          slug: "entry-2"
        }
      ],
      testOptions,
      superuserToken
    );

    context.store.set({ id: entry1.slug as string, data: entry1 });
    context.store.set({ id: entry2.slug as string, data: entry2 });

    await deleteEntry(entry1.id, testOptions, superuserToken);

    await cleanupEntries(testOptions, context, superuserToken);

    expect(context.store.keys()).toHaveLength(1);
    expect(context.store.has(entry2.slug as string)).toBe(true);
    expect(context.store.has(entry1.slug as string)).toBe(false);

    await deleteCollection(testOptions, superuserToken);
  });

  test("should not cleanup entries if all are up-to-date", async () => {
    const entry = await insertEntry(
      {
        email: "cleanup@test.de",
        password: "test1234",
        passwordConfirm: "test1234",
        name: "Cleanup Test"
      },
      options,
      superuserToken
    );

    const storeDeleteSpy = vi.spyOn(context.store, "delete");

    context.store.set({ id: entry.id, data: entry });

    await cleanupEntries(options, context, superuserToken);

    expect(context.store.has(entry.id)).toBeTruthy();
    expect(context.store.keys()).toHaveLength(1);
    expect(storeDeleteSpy).not.toHaveBeenCalled();

    await deleteEntry(entry.id, options, superuserToken);
  });
});
