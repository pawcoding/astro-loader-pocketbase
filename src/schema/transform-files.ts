import { z } from "astro/zod";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { PocketBaseSchemaEntry } from "../types/pocketbase-schema.type";

/**
 * Transforms file names in a PocketBase entry to file URLs.
 *
 * @param baseUrl URL of the PocketBase instance.
 * @param collection Collection of the entry.
 * @param entry Entry to transform.
 */
export function transformFiles(
  baseUrl: string,
  fileFields: Array<PocketBaseSchemaEntry>,
  entry: PocketBaseEntry
): PocketBaseEntry {
  // Transform all file names to file URLs
  for (const field of fileFields) {
    const fieldName = field.name;

    if (field.maxSelect === 1) {
      // Validate and parse the file name as a string or undefined
      const fileNameResult = z.string().optional().safeParse(entry[fieldName]);
      if (!fileNameResult.success || !fileNameResult.data) {
        continue;
      }

      // Transform the file name to a file URL
      entry[fieldName] = transformFileUrl(
        baseUrl,
        entry.collectionName,
        entry.id,
        fileNameResult.data
      );
    } else {
      // Validate and parse the file names as an array of strings or undefined
      const fileNamesResult = z
        .array(z.string())
        .optional()
        .safeParse(entry[fieldName]);
      if (!fileNamesResult.success || !fileNamesResult.data) {
        continue;
      }

      // Transform all file names to file URLs
      entry[fieldName] = fileNamesResult.data.map((file) =>
        transformFileUrl(baseUrl, entry.collectionName, entry.id, file)
      );
    }
  }

  return entry;
}

/**
 * Transforms a file name to a PocketBase file URL.
 *
 * @param base Base URL of the PocketBase instance.
 * @param collectionName Name of the collection.
 * @param entryId ID of the entry.
 * @param file Name of the file.
 */
export function transformFileUrl(
  base: string,
  collectionName: string,
  entryId: string,
  file: string
): string {
  return `${base}/api/files/${collectionName}/${entryId}/${file}`;
}
