/**
 * Combine basic, special, and user-specified fields for PocketBase API requests.
 * This utility ensures that required system fields are always included in API requests.
 *
 * @param userFields Array of fields specified by the user, or undefined for all fields
 * @returns Combined array of fields to include in the API request, or undefined for all fields
 */
export function combineFieldsForRequest(
  userFields: Array<string> | undefined
): Array<string> | undefined {
  // If no fields specified, return undefined to get all fields
  if (!userFields) {
    return undefined;
  }

  // Basic fields that are always required by the system
  const basicFields = ["id", "collectionId", "collectionName"];

  // Special fields that are commonly needed but not always present
  // These include metadata fields that might be useful for content management
  const specialFields = ["created", "updated"];

  // Combine all field sets, removing duplicates
  const allFields = [
    ...new Set([...basicFields, ...specialFields, ...userFields])
  ];

  return allFields;
}
