import type { LiveDataEntry } from "astro";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";

export function parseLiveEntry<TEntry extends PocketBaseEntry>(
  entry: TEntry,
  options: ExperimentalPocketBaseLiveLoaderOptions
): LiveDataEntry<TEntry> {
  let updated: string | undefined;
  if (options.updatedField) {
    // If an updated field is provided, use it to determine the last modified date
    updated = `${entry[options.updatedField]}`;
  }

  if (!options.contentFields) {
    return {
      id: entry.id,
      data: entry,
      cacheHint: {
        tags: [`${options.collectionName}-${entry.id}`],
        lastModified: updated ? new Date(updated) : undefined
      }
    };
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

  return {
    id: entry.id,
    data: entry,
    // @ts-expect-error - Docs say this is possible
    rendered: {
      html: content
    },
    cacheHint: {
      tags: [`${options.collectionName}-${entry.id}`],
      lastModified: updated ? new Date(updated) : undefined
    }
  };
}
