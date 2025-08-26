/**
 * Extract field names from fields that may contain modifiers like :excerpt().
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

  return fields.map((field) => field.split(":")[0]);
}
