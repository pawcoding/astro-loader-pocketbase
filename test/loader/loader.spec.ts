import type { LoaderContext } from "astro/loaders";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import packageJson from "../../package.json";
import { cleanupEntries } from "../../src/loader/cleanup-entries";
import { handleRealtimeUpdates } from "../../src/loader/handle-realtime-updates";
import { loadEntries } from "../../src/loader/load-entries";
import { loader } from "../../src/loader/loader";
import { getSuperuserToken } from "../../src/utils/get-superuser-token";
import { createLoaderContext } from "../_mocks/create-loader-context";
import { createLoaderOptions } from "../_mocks/create-loader-options";
import { createPocketbaseEntry } from "../_mocks/create-pocketbase-entry";

vi.mock("../../src/utils/get-superuser-token");
vi.mock("../../src/utils/should-refresh");
vi.mock("../../src/loader/cleanup-entries");
vi.mock("../../src/loader/handle-realtime-updates");
vi.mock("../../src/loader/load-entries");

describe("loader", async () => {
  let context: LoaderContext;
  const options = createLoaderOptions({ updatedField: "updated" });
  const srm = await import("../../src/utils/should-refresh");
  const hrum = await import("../../src/loader/handle-realtime-updates");
  const gstm = await import("../../src/utils/get-superuser-token");

  beforeEach(() => {
    context = createLoaderContext();
    context.meta.set("version", packageJson.version);
    context.meta.set(
      "last-modified",
      new Date().toISOString().replace("T", " ")
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should not refresh if shouldRefresh returns "skip"', async () => {
    srm.shouldRefresh = vi.fn().mockReturnValue("skip");

    await loader(context, options);

    expect(srm.shouldRefresh).toHaveBeenCalledOnce();
    expect(handleRealtimeUpdates).not.toHaveBeenCalled();
    expect(loadEntries).not.toHaveBeenCalled();
  });

  test("should not refresh if handleRealtimeUpdates handled update", async () => {
    srm.shouldRefresh = vi.fn().mockReturnValue("refresh");
    hrum.handleRealtimeUpdates = vi.fn().mockResolvedValue(true);

    await loader(context, options);

    expect(handleRealtimeUpdates).toHaveBeenCalledOnce();
    expect(loadEntries).not.toHaveBeenCalled();
  });

  test('should clear store and disable incremental builds if shouldRefresh returns "force"', async () => {
    srm.shouldRefresh = vi.fn().mockReturnValue("force");
    hrum.handleRealtimeUpdates = vi.fn().mockResolvedValue(false);
    gstm.getSuperuserToken = vi.fn().mockResolvedValue(undefined);
    const storeClearSpy = vi.spyOn(context.store, "clear");

    await loader(context, options);

    expect(storeClearSpy).toHaveBeenCalledOnce();
    expect(loadEntries).toHaveBeenCalledWith(
      options,
      context,
      undefined,
      undefined
    );
  });

  test("should clear store and disable incremental builds if version changes", async () => {
    srm.shouldRefresh = vi.fn().mockReturnValue("refresh");
    hrum.handleRealtimeUpdates = vi.fn().mockResolvedValue(false);
    gstm.getSuperuserToken = vi.fn().mockResolvedValue(undefined);
    const storeClearSpy = vi.spyOn(context.store, "clear");
    context.meta.set("version", "invalidVersion");

    await loader(context, options);

    expect(storeClearSpy).toHaveBeenCalledOnce();
    expect(loadEntries).toHaveBeenCalledWith(
      options,
      context,
      undefined,
      undefined
    );
  });

  test("should disable incremental builds if no updatedField is provided", async () => {
    srm.shouldRefresh = vi.fn().mockReturnValue("refresh");
    hrum.handleRealtimeUpdates = vi.fn().mockResolvedValue(false);
    gstm.getSuperuserToken = vi.fn().mockResolvedValue(undefined);
    options.updatedField = undefined;

    await loader(context, options);

    expect(loadEntries).toHaveBeenCalledWith(
      options,
      context,
      undefined,
      undefined
    );
  });

  test("should get superuser token if superuserCredentials are provided", async () => {
    const token = "token";
    srm.shouldRefresh = vi.fn().mockReturnValue("refresh");
    hrum.handleRealtimeUpdates = vi.fn().mockResolvedValue(false);
    gstm.getSuperuserToken = vi.fn().mockResolvedValue(token);
    const entry = createPocketbaseEntry();
    context.store.set({ id: entry.id, data: entry });

    await loader(context, options);

    expect(getSuperuserToken).toHaveBeenCalledOnce();
    expect(cleanupEntries).toHaveBeenCalledWith(options, context, token);
    expect(loadEntries).toHaveBeenCalledWith(
      options,
      context,
      token,
      undefined
    );
  });

  test("should cleanup old entries if store has keys", async () => {
    srm.shouldRefresh = vi.fn().mockReturnValue("refresh");
    hrum.handleRealtimeUpdates = vi.fn().mockResolvedValue(false);
    gstm.getSuperuserToken = vi.fn().mockResolvedValue(undefined);
    const entry = createPocketbaseEntry();
    context.store.set({ id: entry.id, data: entry });

    await loader(context, options);

    expect(cleanupEntries).toHaveBeenCalledWith(options, context, undefined);
  });

  test("should set last-modified and version in meta after loading entries", async () => {
    srm.shouldRefresh = vi.fn().mockReturnValue("refresh");
    hrum.handleRealtimeUpdates = vi.fn().mockResolvedValue(false);
    gstm.getSuperuserToken = vi.fn().mockResolvedValue(undefined);
    context.meta.delete("last-modified");
    context.meta.delete("version");

    await loader(context, options);

    expect(context.meta.get("last-modified")).toBeDefined();
    expect(context.meta.get("version")).toBe(packageJson.version);
  });
});
