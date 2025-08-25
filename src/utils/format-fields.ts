/**
 * Format fields option into an array and validate for expand usage.
 * Handles wildcard "*" and excerpt field modifiers according to PocketBase API spec.
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
    // Split carefully, respecting parentheses in excerpt syntax
    fieldList = smartSplitFields(fields).map((f) => f.trim());
  }

  // Check for "*" wildcard after splitting - if found anywhere, include all fields
  const hasWildcard = fieldList.some((field) => field === "*");
  if (hasWildcard) {
    // Still check for expand to show warning even with wildcard
    const hasExpand = fieldList.some((field) => field.includes("expand"));
    if (hasExpand) {
      console.warn(
        'The "expand" field is not currently supported by the PocketBase loader. ' +
          "Expand functionality may be added in a future version."
      );
    }
    return undefined;
  }

  // Warn if expand is used since it's not currently supported
  // Use string includes to check for expand fields
  const hasExpand = fieldList.some((field) => field.includes("expand"));

  if (hasExpand) {
    console.warn(
      'The "expand" field is not currently supported by the PocketBase loader. ' +
        "Expand functionality may be added in a future version."
    );
  }

  // Handle excerpt field modifiers (:excerpt(maxLength, withEllipsis?))
  // These are valid PocketBase field modifiers that should be preserved
  const processedFields = fieldList.map((field) => {
    // Check if field has excerpt modifier
    if (field.includes(":excerpt")) {
      // Validate excerpt syntax - should match pattern: fieldname:excerpt(number, boolean?)
      const excerptPattern =
        /^[a-zA-Z_][a-zA-Z0-9_.]*:excerpt\(\d+(?:,\s*(?:true|false))?\)$/;
      if (!excerptPattern.test(field)) {
        console.warn(
          `Invalid excerpt syntax for field "${field}". ` +
            "Expected format: fieldname:excerpt(maxLength, withEllipsis?)"
        );
      }
    }
    return field;
  });

  return processedFields;
}

/**
 * Smart split that respects parentheses in excerpt syntax
 */
function smartSplitFields(fieldsString: string): Array<string> {
  const fields: Array<string> = [];
  let current = "";
  let parenDepth = 0;

  for (const char of fieldsString) {
    if (char === "(") {
      parenDepth++;
      current += char;
    } else if (char === ")") {
      parenDepth--;
      current += char;
    } else if (char === "," && parenDepth === 0) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  if (current) {
    fields.push(current);
  }

  return fields;
}
