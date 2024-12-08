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
      const fileName = entry[fieldName] as string | undefined;
      // Check if a file name is present
      if (!fileName) {
        continue;
      }

      // Transform the file name to a file URL
      entry[fieldName] = transformFileUrl(
        baseUrl,
        entry.collectionName,
        entry.id,
        fileName
      );
    } else {
      const fileNames = entry[fieldName] as Array<string> | undefined;
      // Check if file names are present
      if (!fileNames) {
        continue;
      }

      // Transform all file names to file URLs
      entry[fieldName] = fileNames.map((file) =>
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
function transformFileUrl(
  base: string,
  collectionName: string,
  entryId: string,
  file: string
): string {
  return `${base}/api/files/${collectionName}/${entryId}/${file}`;
}
