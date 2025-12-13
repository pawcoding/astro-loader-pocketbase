import type { LiveDataEntry } from "astro";
import { LiveCollectionError } from "astro/content/runtime";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { PocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";
import { fetchEntry } from "./fetch-entry";
import { parseLiveEntry } from "./parse-live-entry";

/**
 * Loads and parses a single PocketBase entry for live data, returning the entry or an error.
 */
export async function liveEntryLoader<TEntry extends PocketBaseEntry>(
  id: string,
  options: PocketBaseLiveLoaderOptions,
  token: string | undefined
): Promise<LiveDataEntry<TEntry> | { error: LiveCollectionError }> {
  try {
    const entry = await fetchEntry<TEntry>(id, options, token);
    return parseLiveEntry(entry, options);
  } catch (error) {
    if (error instanceof LiveCollectionError) {
      return { error };
    }

    if (error instanceof Error) {
      return {
        error: new LiveCollectionError(
          options.collectionName,
          error.message,
          error
        )
      };
    }

    return {
      error: new LiveCollectionError(options.collectionName, String(error))
    };
  }
}
