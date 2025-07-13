import type { LiveDataCollection, LiveDataEntry } from "astro";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";
import { fetchCollection } from "./fetch-collection";
import { parseLiveEntry } from "./parse-live-entry";

export async function liveCollectionLoader<TEntry extends PocketBaseEntry>(
  options: ExperimentalPocketBaseLiveLoaderOptions,
  token: string | undefined
): Promise<LiveDataCollection<TEntry> | { error: Error }> {
  const entries: Array<LiveDataEntry<TEntry>> = [];

  try {
    await fetchCollection<TEntry>(
      options,
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
