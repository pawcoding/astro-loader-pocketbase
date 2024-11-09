import type { LoaderContext } from "astro/loaders";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";
import { slugify } from "./slugify";

/**
 * Parse an entry from PocketBase to match the schema and store it in the store.
 *
 * @param entry Entry to parse.
 * @param context Context of the loader.
 * @param idField Field to use as id for the entry.
 *                If not provided, the id of the entry will be used.
 * @param contentFields Field(s) to use as content for the entry.
 *                      If multiple fields are used, they will be concatenated and wrapped in `<section>` elements.
 */
export async function parseEntry(
  entry: PocketBaseEntry,
  { generateDigest, parseData, store, logger }: LoaderContext,
  { idField, contentFields, updatedField }: PocketBaseLoaderOptions
): Promise<void> {
  let id = entry.id;
  if (idField) {
    // Get the custom ID of the entry if it exists
    const customEntryId = entry[idField];

    if (!customEntryId) {
      logger.warn(
        `The entry "${id}" does not have a value for field ${idField}. Using the default ID instead.`
      );
    } else {
      id = slugify(`${customEntryId}`);
    }
  }

  const oldEntry = store.get(id);
  if (oldEntry && oldEntry.data.id !== entry.id) {
    logger.warn(
      `The entry "${entry.id}" seems to be a duplicate of "${oldEntry.data.id}". Please make sure to use unique IDs in the column "${idField}".`
    );
  }

  // Parse the data to match the schema
  // This will throw an error if the data does not match the schema
  const data = await parseData({
    id,
    data: entry
  });

  // Get the updated date of the entry
  let updated: string | undefined;
  if (updatedField) {
    updated = `${entry[updatedField]}`;
  }

  // Generate a digest for the entry
  // If no updated date is available, the digest will be generated from the whole entry
  const digest = generateDigest(updated ?? entry);

  if (!contentFields) {
    // Store the entry
    store.set({
      id,
      data,
      digest
    });
    return;
  }

  // Generate the content for the entry
  let content: string;
  if (typeof contentFields === "string") {
    // Only one field is used as content
    content = `${entry[contentFields]}`;
  } else {
    // Multiple fields are used as content, wrap each block in a section and concatenate them
    content = contentFields
      .map((field) => entry[field])
      .map((block) => `<section>${block}</section>`)
      .join("");
  }

  // Store the entry
  store.set({
    id,
    data,
    digest,
    rendered: {
      html: content
    }
  });
}
