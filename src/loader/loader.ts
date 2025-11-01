import type { LoaderContext } from "astro/loaders";
import packageJson from "../../package.json";
import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";
import { shouldRefresh } from "../utils/should-refresh";
import { cleanupEntries } from "./cleanup-entries";
import { handleRealtimeUpdates } from "./handle-realtime-updates";
import { loadEntries } from "./load-entries";

/**
 * Load entries from a PocketBase collection.
 */
export async function loader(
  context: LoaderContext,
  options: PocketBaseLoaderOptions,
  token: string | undefined
): Promise<void> {
  context.logger.label = `pocketbase-loader:${options.collectionName}`;

  // Check if the collection should be refreshed.
  const refresh = shouldRefresh(context.refreshContextData, options);
  if (refresh === "skip") {
    return;
  }

  // Handle realtime updates
  const handled = await handleRealtimeUpdates(context, options);
  if (handled) {
    return;
  }

  // Get the date of the last fetch to only update changed entries.
  let lastModified = context.meta.get("last-modified");

  // Force a full update if the refresh is forced
  if (refresh === "force") {
    lastModified = undefined;
    context.store.clear();
  }

  // Check if the version has changed to force an update
  const lastVersion = context.meta.get("version");
  if (lastVersion !== packageJson.version) {
    if (lastVersion) {
      context.logger.info(
        `PocketBase loader was updated from ${lastVersion} to ${packageJson.version}. All entries will be loaded again.`
      );
    }

    // Disable incremental builds and clear the store
    lastModified = undefined;
    context.store.clear();
  }

  // Disable incremental builds if no updated field is provided
  if (!options.updatedField) {
    context.logger.info(
      `No "updatedField" was provided. Incremental builds are disabled.`
    );
    lastModified = undefined;
  }

  if (context.store.keys().length > 0) {
    // Cleanup entries that are no longer in the collection
    await cleanupEntries(options, context, token);
  }

  // Load the (modified) entries
  await loadEntries(options, context, token, lastModified);

  // Set the last modified date to the current date
  context.meta.set("last-modified", new Date().toISOString().replace("T", " "));

  context.meta.set("version", packageJson.version);
}
