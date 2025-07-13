import type { LiveDataEntry } from "astro";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";
import { fetchEntry } from "./fetch-entry";
import { parseLiveEntry } from "./parse-live-entry";

export async function liveEntryLoader<TEntry extends PocketBaseEntry>(
  id: string,
  options: ExperimentalPocketBaseLiveLoaderOptions,
  token: string | undefined
): Promise<LiveDataEntry<TEntry> | { error: Error }> {
  try {
    const entry = await fetchEntry<TEntry>(id, options, token);
    return parseLiveEntry(entry, options);
  } catch (error) {
    return { error: error as Error };
  }
}
