/**
 * Format fields option into an array and validate for expand usage.
 *
 * @param fields The fields option (string or array)
 * @returns Formatted fields array, or undefined if no fields specified or "*" wildcard is used
 */
export function formatFields(
  fields: string | Array<string> | undefined
): Array<string> | undefined {
  if (!fields) {
    return undefined;
  }

  let fieldList: Array<string>;

  if (Array.isArray(fields)) {
    fieldList = fields.map((f) => f.trim());
  } else {
    // Handle "*" wildcard which means include all fields
    if (fields.trim() === "*") {
      return undefined;
    }
    fieldList = fields.split(",").map((f) => f.trim());
  }

  // Warn if expand is used since it's not currently supported
  // Check for exact field match or field with dot notation (e.g., "expand" or "expand.user")
  const hasExpand = fieldList.some(
    (field) => field === "expand" || field.startsWith("expand.")
  );

  if (hasExpand) {
    console.warn(
      'The "expand" field is not currently supported by the PocketBase loader. ' +
        "Expand functionality may be added in a future version."
    );
  }

  return fieldList;
}
