import type { LoaderContext } from "astro/loaders";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";
import { isRealtimeData } from "./utils/is-realtime-data";
import { parseEntry } from "./utils/parse-entry";

/**
 * Handles realtime updates for the loader without making any new network requests.
 *
 * Returns `true` if the data was handled and no further action is needed.
 */
export async function handleRealtimeUpdates(
  context: LoaderContext,
  options: PocketBaseLoaderOptions
): Promise<boolean> {
  // Check if data was provided via the refresh context
  if (!context.refreshContextData?.data) {
    return false;
  }

  // Check if the data is PocketBase realtime data
  const data = context.refreshContextData.data;
  if (!isRealtimeData(data)) {
    return false;
  }

  // Check if the collection name matches the current collection
  if (data.record.collectionName !== options.collectionName) {
    return false;
  }

  // Handle deleted entry
  if (data.action === "delete") {
    context.logger.info("Removing deleted entry");
    context.store.delete(data.record.id);
    return true;
  }

  // Handle updated or new entry
  if (data.action === "update") {
    context.logger.info("Updating outdated entry");
  } else {
    context.logger.info("Creating new entry");
  }

  // Parse the entry and store
  await parseEntry(data.record, context, options);
  return true;
}
