import type { LiveDataCollection, LiveDataEntry } from "astro";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";
import { fetchCollection } from "./fetch-collection";
import { parseLiveEntry } from "./parse-live-entry";

export async function liveCollectionLoader<TEntry extends PocketBaseEntry>(
  additionalFilter: string | undefined,
  options: ExperimentalPocketBaseLiveLoaderOptions,
  token: string | undefined
): Promise<LiveDataCollection<TEntry> | { error: Error }> {
  const entries: Array<LiveDataEntry<TEntry>> = [];

  // Combine the default filter for the collection with the additional filter
  // provided by the `getLiveCollection` function.
  const filter = [options.filter, additionalFilter]
    .filter(Boolean)
    .map((f) => `(${f})`)
    .join("&&");

  try {
    await fetchCollection<TEntry>(
      { ...options, filter },
      async (chunk) => {
        entries.push(...chunk.map((entry) => parseLiveEntry(entry, options)));
      },
      token,
      undefined
    );
  } catch (error) {
    return { error: error as Error };
  }

  return {
    entries
  };
}
