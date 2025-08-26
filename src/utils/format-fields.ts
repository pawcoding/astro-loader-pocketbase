import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";

/**
 * Format fields option into an array and validate for expand usage.
 * Handles wildcard "*" and preserves excerpt field modifiers.
 *
 * @param fields The fields option (string or array)
 * @returns Formatted fields array, or undefined if no fields specified or "*" wildcard is used
 */
export function formatFields(
  fields: PocketBaseLoaderOptions["fields"]
): Array<string> | undefined {
  if (!fields || fields.length === 0) {
    return undefined;
  }

  let fieldList: Array<string>;
  if (Array.isArray(fields)) {
    fieldList = fields.map((f) => f.trim());
  } else {
    // Split carefully, respecting parentheses in excerpt syntax
    fieldList = splitFieldsString(fields).map((f) => f.trim());
  }

  // Warn if expand is used since it's not currently supported
  const hasExpand = fieldList.some((field) => field.includes("expand"));
  if (hasExpand) {
    console.warn(
      'The "expand" parameter is not currently supported by astro-loader-pocketbase and will be filtered out.'
    );
    fieldList = fieldList.filter((field) => !field.includes("expand"));
  }

  // Check for "*" wildcard - if found anywhere, include all fields
  const hasWildcard = fieldList.some((field) => field === "*");
  if (hasWildcard) {
    return undefined;
  }

  return fieldList;
}

/**
 * Splits the fields string at `,` but respects the `:excerpt(number, boolean)` option
 */
function splitFieldsString(fieldsString: string): Array<string> {
  // First, split by comma
  const initialSplit = fieldsString.split(",");

  const fields: Array<string> = [];
  for (let i = 0; i < initialSplit.length; i++) {
    const part = initialSplit[i];

    if (part.includes("(") && !part.includes(")")) {
      fields.push(`${part},${initialSplit[++i]}`);
      continue;
    }

    fields.push(part);
  }

  return fields;
}
