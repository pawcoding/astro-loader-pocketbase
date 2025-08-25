/**
 * Extract field names from fields that may contain modifiers like :excerpt().
 * This is used for schema parsing where we need the actual field names without modifiers.
 *
 * @param fields Array of field specifications that may contain modifiers
 * @returns Array of clean field names suitable for schema parsing
 */
export function extractFieldNames(
  fields: Array<string> | undefined
): Array<string> | undefined {
  if (!fields) {
    return undefined;
  }

  return fields.map((field) => {
    // Extract the field name before any colon modifier (like :excerpt)
    const colonIndex = field.indexOf(":");
    if (colonIndex !== -1) {
      return field.substring(0, colonIndex);
    }
    return field;
  });
}
