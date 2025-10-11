import type { LiveDataEntry } from "astro";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";
import { fetchEntry } from "./fetch-entry";
import { parseLiveEntry } from "./parse-live-entry";

/**
 * Loads and parses a single PocketBase entry for live data, returning the entry or an error.
 */
export async function liveEntryLoader<TEntry extends PocketBaseEntry>(
  id: string,
  options: ExperimentalPocketBaseLiveLoaderOptions,
  token: string | undefined
): Promise<LiveDataEntry<TEntry> | { error: Error }> {
  try {
    const entry = await fetchEntry<TEntry>(id, options, token);
    return parseLiveEntry(entry, options);
  } catch (error) {
    // Convert unknown error to Error instance
    return {
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
