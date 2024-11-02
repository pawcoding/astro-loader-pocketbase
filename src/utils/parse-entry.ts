import type { LoaderContext } from "astro/loaders";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";

/**
 * Parse an entry from PocketBase to match the schema and store it in the store.
 *
 * @param entry Entry to parse.
 * @param context Context of the loader.
 * @param id ID to use for the entry. If not provided, the ID of the entry will be used.
 * @param contentFields Field(s) to use as content for the entry.
 *                      If multiple fields are used, they will be concatenated and wrapped in `<section>` elements.
 */
export async function parseEntry(
  entry: PocketBaseEntry,
  { generateDigest, parseData, store }: LoaderContext,
  id?: string,
  contentFields?: string | Array<string>
): Promise<void> {
  // Parse the data to match the schema
  // This will throw an error if the data does not match the schema
  const data = await parseData({
    id: entry[id as keyof PocketBaseEntry] as string || entry.id,
    data: entry
  });

  // Generate a digest for the entry
  // Normal collections use the updated date that is always updated when the entry is updated.
  // If the entry was never updated, the created date can be used as a fallback.
  // View collections don't necessarily publish the updated date, so the whole entry is used for the digest.
  const digest = generateDigest(entry.updated ?? entry.created ?? entry);

  if (!contentFields) {
    // Store the entry
    store.set({
      id: entry[id as keyof PocketBaseEntry] as string || entry.id,
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
    id: entry[id as keyof PocketBaseEntry] as string || entry.id,
    data,
    digest,
    rendered: {
      html: content
    }
  });
}
