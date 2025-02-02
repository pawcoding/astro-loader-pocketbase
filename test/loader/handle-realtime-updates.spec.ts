import { assert, describe, expect, test, vi } from "vitest";
import { handleRealtimeUpdates } from "../../src/loader/handle-realtime-updates";
import { createLoaderContext } from "../_mocks/create-loader-context";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { createPocketbaseEntry } from "../_mocks/create-pocketbase-entry";

describe("handleRealtimeUpdates", () => {
  const options = createLoaderOptions();
  const record = createPocketbaseEntry();

  test("should return false if no refresh context data is provided", async () => {
    const context = createLoaderContext();

    const result = await handleRealtimeUpdates(context, options);
    assert(!result);
  });

  test("should return false if data is not PocketBase realtime data", async () => {
    const context = createLoaderContext({
      refreshContextData: { data: { invalid: "data" } }
    });

    let result = await handleRealtimeUpdates(context, options);
    assert(!result, "Invalid data");

    context.refreshContextData = { data: { record, action: "invalid" } };

    result = await handleRealtimeUpdates(context, options);
    assert(!result, "Invalid action");

    context.refreshContextData = {
      data: { record: { invalid: "data" }, action: "create" }
    };

    result = await handleRealtimeUpdates(context, options);
    assert(!result, "Invalid record");
  });

  test("should return false if collection name does not match", async () => {
    const context = createLoaderContext({
      refreshContextData: {
        data: { record, action: "create" }
      }
    });
    const options = createLoaderOptions({
      collectionName: record.collectionName + "invalid"
    });
    const result = await handleRealtimeUpdates(context, options);

    assert(!result);
  });

  test("should handle deleted entry and return true", async () => {
    const context = createLoaderContext({
      refreshContextData: {
        data: {
          record,
          action: "delete"
        }
      }
    });

    const deleteSpy = vi.spyOn(context.store, "delete");

    const result = await handleRealtimeUpdates(context, options);
    assert(result);

    expect(deleteSpy).toHaveBeenCalledExactlyOnceWith(
      // @ts-expect-error data is unknown
      context.refreshContextData.data.record.id
    );
  });

  test("should handle updated entry and return true", async () => {
    const context = createLoaderContext({
      refreshContextData: {
        data: {
          record,
          action: "update"
        }
      }
    });

    const storeSetSpy = vi.spyOn(context.store, "set");

    const result = await handleRealtimeUpdates(context, options);
    assert(result);

    expect(storeSetSpy).toHaveBeenCalledOnce();
  });

  test("should handle new entry and return true", async () => {
    const context = createLoaderContext({
      refreshContextData: {
        data: {
          record,
          action: "create"
        }
      }
    });

    const storeSetSpy = vi.spyOn(context.store, "set");

    const result = await handleRealtimeUpdates(context, options);
    assert(result);

    expect(storeSetSpy).toHaveBeenCalledOnce();
  });
});
