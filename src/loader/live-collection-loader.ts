import type { LiveDataCollection, LiveDataEntry } from "astro";
import { LiveCollectionError } from "astro/content/runtime";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { PocketBaseLiveLoaderCollectionFilter } from "../types/pocketbase-live-loader-filter.type";
import type { PocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";
import { fetchCollection } from "./fetch-collection";
import { parseLiveEntry } from "./parse-live-entry";

/**
 * Loads and parses a PocketBase collection for live data, returning entries or an error.
 */
export async function liveCollectionLoader<TEntry extends PocketBaseEntry>(
  collectionFilter: PocketBaseLiveLoaderCollectionFilter | undefined,
  options: PocketBaseLiveLoaderOptions,
  token: string | undefined
): Promise<LiveDataCollection<TEntry> | { error: LiveCollectionError }> {
  const entries: Array<LiveDataEntry<TEntry>> = [];

  try {
    await fetchCollection<TEntry>(
      options,
      async (chunk) => {
        entries.push(...chunk.map((entry) => parseLiveEntry(entry, options)));
      },
      token,
      collectionFilter
    );
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

  return {
    entries
  };
}
