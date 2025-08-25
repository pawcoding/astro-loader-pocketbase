/**
 * Format fields option into a comma-separated string and validate for expand usage.
 *
 * @param fields The fields option (string or array)
 * @returns Formatted fields string, or undefined if no fields specified
 */
export function formatFields(
  fields: string | Array<string> | undefined
): string | undefined {
  if (!fields) {
    return undefined;
  }

  let fieldsStr: string;

  if (Array.isArray(fields)) {
    fieldsStr = fields.join(",");
  } else {
    fieldsStr = fields;
  }

  // Warn if expand is used since it's not currently supported
  // Check for exact field match or field with dot notation (e.g., "expand" or "expand.user")
  const fieldList = fieldsStr.split(",").map((f) => f.trim());
  const hasExpand = fieldList.some(
    (field) => field === "expand" || field.startsWith("expand.")
  );

  if (hasExpand) {
    console.warn(
      'The "expand" field is not currently supported by the PocketBase loader. ' +
        "Expand functionality may be added in a future version."
    );
  }

  return fieldsStr;
}
