import type { LoaderContext } from "astro/loaders";
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
import { deleteEntry } from "../_mocks/delete-entry";
import { insertEntry } from "../_mocks/insert-entry";

describe("cleanupEntries", () => {
  const options = createLoaderOptions({ collectionName: "users" });
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

  test("should log error if collection is not accessible without superuser rights", async () => {
    await cleanupEntries(
      { ...options, collectionName: "_superusers" },
      context,
      undefined
    );

    expect(context.logger.error).toHaveBeenCalledOnce();
  });

  test("should log error if collection doesn't exist", async () => {
    const storeDeleteSpy = vi.spyOn(context.store, "delete");
    const storeValuesSpy = vi.spyOn(context.store, "values");

    await cleanupEntries(
      { ...options, collectionName: "nonExistent" },
      context,
      superuserToken
    );

    expect(context.logger.error).toHaveBeenCalledOnce();
    expect(storeDeleteSpy).not.toHaveBeenCalled();
    expect(storeValuesSpy).not.toHaveBeenCalled();
  });

  test("should cleanup old entries", async () => {
    const entry = createPocketbaseEntry();
    context.store.set({ id: entry.id, data: entry });

    await cleanupEntries(options, context, superuserToken);

    expect(context.logger.error).not.toHaveBeenCalled();
    expect(context.store.has(entry.id)).toBe(false);
    expect(context.store.keys()).toHaveLength(0);
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

    expect(context.store.has(entry.id)).toBe(true);
    expect(context.store.keys()).toHaveLength(1);
    expect(storeDeleteSpy).not.toHaveBeenCalled();

    await deleteEntry(entry.id, options, superuserToken);
  });
});
