import type { LoaderContext } from "astro/loaders";
import type { PocketBaseEntry } from "../types/pocketbase-base.type";

/**
 * Parse an entry from PocketBase to match the schema and store it in the store.
 *
 * @param entry Entry to parse.
 * @param context Context of the loader.
 * @param contentFields Field(s) to use as content for the entry.
 *                      If multiple fields are used, they will be concatenated and wrapped in `<section>` elements.
 */
export async function parseEntry(
  entry: PocketBaseEntry,
  { generateDigest, parseData, store }: LoaderContext,
  contentFields: string | Array<string>
): Promise<void> {
  // Parse the data to match the schema
  // This will throw an error if the data does not match the schema
  const data = await parseData({
    id: entry.id,
    data: entry
  });

  // Generate a digest for the entry
  // We can use the updated data as an identifier if the entry has changed since PocketBase automatically updates this value on every change
  const digest = generateDigest(entry.updated);

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
    id: entry.id,
    data,
    digest,
    rendered: {
      html: content
    }
  });
}
