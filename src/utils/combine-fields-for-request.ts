import type {
  PocketBaseLoaderBaseOptions,
  PocketBaseLoaderOptions
} from "../types/pocketbase-loader-options.type";

/**
 * Combine basic, special, and user-specified fields for PocketBase API requests.
 * This utility ensures that required system fields are always included in API requests.
 *
 * @param userFields Array of fields specified by the user, or undefined for all fields
 * @param options PocketBase loader options containing custom field configurations
 * @returns Combined array of fields to include in the API request, or undefined for all fields
 */
export function combineFieldsForRequest(
  userFields: Array<string> | undefined,
  options: Pick<PocketBaseLoaderBaseOptions, "updatedField" | "contentFields"> &
    Pick<PocketBaseLoaderOptions, "idField">
): Array<string> | undefined {
  // If no fields specified, return undefined to get all fields
  if (!userFields) {
    return undefined;
  }

  // Basic fields that are always required by the loader
  const basicFields = ["id", "collectionId", "collectionName"];

  // Special fields that are configured in options
  const specialFields: Array<string> = [];

  // Add custom id field if specified
  if (options.idField && options.idField !== "id") {
    specialFields.push(options.idField);
  }

  // Add updated field if specified
  if (options.updatedField) {
    specialFields.push(options.updatedField);
  }

  // Add content fields if specified
  if (options.contentFields) {
    if (Array.isArray(options.contentFields)) {
      specialFields.push(...options.contentFields);
    } else {
      specialFields.push(options.contentFields);
    }
  }

  // Combine all field sets, removing duplicates
  const allFields = [
    ...new Set([...basicFields, ...specialFields, ...userFields])
  ];

  return allFields;
}
