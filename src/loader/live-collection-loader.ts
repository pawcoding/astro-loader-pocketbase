import type { LiveDataCollection, LiveDataEntry } from "astro";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { ExperimentalPocketBaseLiveLoaderCollectionFilter } from "../types/pocketbase-live-loader-filter.type";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";
import { fetchCollection } from "./fetch-collection";
import { parseLiveEntry } from "./parse-live-entry";

/**
 * Loads and parses a PocketBase collection for live data, returning entries or an error.
 */
export async function liveCollectionLoader<TEntry extends PocketBaseEntry>(
  collectionFilter:
    | ExperimentalPocketBaseLiveLoaderCollectionFilter
    | undefined,
  options: ExperimentalPocketBaseLiveLoaderOptions,
  token: string | undefined
): Promise<LiveDataCollection<TEntry> | { error: Error }> {
  const entries: Array<LiveDataEntry<TEntry>> = [];

  try {
    await fetchCollection<TEntry>(
      options,
      // oxlint-disable-next-line require-await
      async (chunk) => {
        entries.push(...chunk.map((entry) => parseLiveEntry(entry, options)));
      },
      token,
      collectionFilter
    );
  } catch (error) {
    return { error: error as Error };
  }

  return {
    entries
  };
}
