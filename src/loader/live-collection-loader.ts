import type { LiveDataCollection, LiveDataEntry } from "astro";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";
import { fetchCollection } from "./fetch-collection";

export async function liveCollectionLoader<TEntry extends PocketBaseEntry>(
  options: ExperimentalPocketBaseLiveLoaderOptions,
  token: string | undefined
): Promise<LiveDataCollection<TEntry> | { error: Error }> {
  const entries: Array<LiveDataEntry<TEntry>> = [];

  await fetchCollection(
    options,
    async (chunk) => {
      for (const entry of chunk) {
        let updated: string | undefined;
        if (options.updatedField) {
          // If an updated field is provided, use it to determine the last modified date
          updated = `${entry[options.updatedField]}`;
        }

        if (!options.contentFields) {
          entries.push({
            id: entry.id,
            data: entry as TEntry,
            cacheHint: {
              tags: [`${options.collectionName}-${entry.id}`],
              lastModified: updated ? new Date(updated) : undefined
            }
          });
          continue;
        }

        let content: string;
        if (typeof options.contentFields === "string") {
          // If a single content field is provided, use it directly
          content = `${entry[options.contentFields]}`;
        } else {
          // If multiple content fields are provided, concatenate them with `<section>` tags
          content = options.contentFields
            .map((field) => `<section>${entry[field]}</section>`)
            .join("");
        }

        entries.push({
          id: entry.id,
          data: entry as TEntry,
          // @ts-expect-error - Docs say this is possible
          rendered: {
            html: content
          },
          cacheHint: {
            tags: [`${options.collectionName}-${entry.id}`],
            lastModified: updated ? new Date(updated) : undefined
          }
        });
      }
    },
    token,
    undefined
  );

  return {
    entries
  };
}
