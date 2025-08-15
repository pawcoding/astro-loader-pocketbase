import type { LiveDataEntry } from "astro";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";

/**
 * Converts a PocketBase entry into a LiveDataEntry for Astro, extracting content and cache metadata.
 */
export function parseLiveEntry<TEntry extends PocketBaseEntry>(
  entry: TEntry,
  options: ExperimentalPocketBaseLiveLoaderOptions
): LiveDataEntry<TEntry> {
  // Build a cache tag
  const tag = `${options.collectionName}-${entry.id}`;

  let lastModified: Date | undefined = undefined;
  // If an updated field is provided and the entry has a valid date value,
  // use it as the last modified date cache hint
  if (options.updatedField && entry[options.updatedField]) {
    const value = `${entry[options.updatedField]}`;
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new TypeError("Invalid date");
      }

      lastModified = date;
    } catch {
      console.warn(
        `Entry ${entry.id} of collection ${options.collectionName} has an invalid date in ${options.updatedField}: ${value}`
      );
    }
  }

  if (!options.contentFields) {
    return {
      id: entry.id,
      data: entry,
      cacheHint: {
        tags: [tag],
        lastModified
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
      tags: [tag],
      lastModified
    }
  };
}
