/**
 * Format fields option into an array and validate for expand usage.
 * Handles wildcard "*" and preserves excerpt field modifiers.
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

  // Warn if expand is used since it's not currently supported
  // Use string includes to check for expand fields
  const hasExpand = fieldList.some((field) => field.includes("expand"));

  if (hasExpand) {
    console.warn(
      'The "expand" field is not currently supported by the PocketBase loader. ' +
        "Expand functionality may be added in a future version."
    );
  }

  // Check for "*" wildcard after expand check - if found anywhere, include all fields
  const hasWildcard = fieldList.some((field) => field === "*");
  if (hasWildcard) {
    return undefined;
  }

  return fieldList;
}

/**
 * Smart split that respects parentheses in excerpt syntax.
 * First splits by comma, then recombines any incomplete parentheses groups.
 */
function smartSplitFields(fieldsString: string): Array<string> {
  // First, split by comma
  const initialSplit = fieldsString.split(",");
  const fields: Array<string> = [];
  let current = "";
  let parenDepth = 0;

  for (const part of initialSplit) {
    // Count parentheses in this part
    for (const char of part) {
      if (char === "(") {
        parenDepth++;
      } else if (char === ")") {
        parenDepth--;
      }
    }

    // Add to current field
    if (current) {
      current += `,${part}`;
    } else {
      current = part;
    }

    // If parentheses are balanced, this field is complete
    if (parenDepth === 0) {
      fields.push(current);
      current = "";
    }
  }

  // If there's any remaining content, add it (shouldn't happen with valid syntax)
  if (current) {
    fields.push(current);
  }

  return fields;
}
