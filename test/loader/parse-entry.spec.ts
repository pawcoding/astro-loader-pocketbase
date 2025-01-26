import type { LoaderContext } from "astro/loaders";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { parseEntry } from "../../src/loader/parse-entry";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";
import { createLoaderContext } from "../_mocks/create-loader-context";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { createPocketbaseEntry } from "../_mocks/create-pocketbase-entry";

describe("parseEntry", () => {
  let context: LoaderContext;
  let entry: PocketBaseEntry;

  beforeEach(() => {
    context = createLoaderContext();
    entry = createPocketbaseEntry();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should use default ID if no custom ID field is provided", async () => {
    const options = createLoaderOptions();

    const storeSetSpy = vi.spyOn(context.store, "set");

    await parseEntry(entry, context, options);

    expect(storeSetSpy).toHaveBeenCalledWith({
      id: entry.id,
      data: {},
      digest: "digest"
    });
  });

  test("should use custom ID if provided", async () => {
    const options = createLoaderOptions({ idField: "customId" });

    const storeSetSpy = vi.spyOn(context.store, "set");

    await parseEntry(entry, context, options);

    expect(storeSetSpy).toHaveBeenCalledWith({
      id: entry.customId,
      data: {},
      digest: "digest"
    });
  });

  test("should log a warning if custom ID field is missing", async () => {
    const options = createLoaderOptions({ idField: "invalidCustomId" });

    await parseEntry(entry, context, options);

    expect(context.logger.warn).toHaveBeenCalledOnce();
  });

  test("should log a warning if entry is a duplicate", async () => {
    const options = createLoaderOptions();

    context.store.set({ id: entry.id, data: { ...entry, id: "456" } });

    await parseEntry(entry, context, options);

    expect(context.logger.warn).toHaveBeenCalledOnce();
  });

  test("should log a warning if entry has a duplicate custom id", async () => {
    const options = createLoaderOptions({ idField: "collectionName" });

    context.store.set({ id: entry.collectionName, data: { id: "456" } });

    await parseEntry(entry, context, options);

    expect(context.logger.warn).toHaveBeenCalledOnce();
  });

  test("should concatenate multiple content fields", async () => {
    const options = createLoaderOptions({
      contentFields: ["collectionName", "customId"]
    });

    const storeSetSpy = vi.spyOn(context.store, "set");

    await parseEntry(entry, context, options);

    expect(storeSetSpy).toHaveBeenCalledWith({
      id: entry.id,
      data: {},
      digest: "digest",
      rendered: {
        html: `<section>${entry.collectionName}</section><section>${entry.customId}</section>`
      }
    });
  });

  test("should handle single content field", async () => {
    const options = createLoaderOptions({ contentFields: "collectionName" });

    const storeSetSpy = vi.spyOn(context.store, "set");

    await parseEntry(entry, context, options);

    expect(storeSetSpy).toHaveBeenCalledWith({
      id: entry.id,
      data: {},
      digest: "digest",
      rendered: {
        html: entry.collectionName
      }
    });
  });
});
