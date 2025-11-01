import { PocketBaseConfigurationError } from "../types/errors";

/**
 * Maximum nesting depth for expand relations as enforced by PocketBase
 */
const MAX_EXPAND_DEPTH = 6;

/**
 * Format and validate expand option for PocketBase API requests.
 * Validates nesting depth and returns formatted expand string.
 */
export function formatExpand(
  expand: Array<string> | undefined,
  collectionName: string
): string | undefined {
  if (!expand || expand.length === 0) {
    return undefined;
  }

  // Validate each expand field for maximum nesting depth and invalid characters
  for (const field of expand) {
    // Check for comma in field name
    if (field.includes(",")) {
      throw new PocketBaseConfigurationError(
        collectionName,
        `Expand field "${field}" contains a comma. Use separate array entries instead of comma-separated values.`
      );
    }

    const depth = (field.match(/\./g) || []).length + 1;
    if (depth > MAX_EXPAND_DEPTH) {
      throw new PocketBaseConfigurationError(
        collectionName,
        `Expand field "${field}" exceeds maximum nesting depth of ${MAX_EXPAND_DEPTH} levels.`
      );
    }
  }

  // Join all expand fields with comma as required by PocketBase
  return expand.join(",");
}
