import { pocketbaseErrorResponseSchema } from "../types/pocketbase-api-responses.type";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import { pocketBaseEntrySchema } from "../types/pocketbase-entry.type";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";
import { combineFieldsForRequest } from "../utils/combine-fields-for-request";
import { formatFields } from "../utils/format-fields";

/**
 * Retrieves a specific entry from a PocketBase collection using its ID and loader options.
 */
export async function fetchEntry<TEntry extends PocketBaseEntry>(
  id: string,
  options: ExperimentalPocketBaseLiveLoaderOptions,
  token: string | undefined
): Promise<TEntry> {
  // Build the URL for the entry endpoint
  const entryUrl = new URL(
    `api/collections/${options.collectionName}/records/${id}`,
    options.url
  );

  // Add fields parameter if specified
  const fieldsArray = formatFields(options.fields);
  const combinedFields = combineFieldsForRequest(fieldsArray, options);
  if (combinedFields) {
    entryUrl.searchParams.set("fields", combinedFields.join(","));
  }

  // Create the headers for the request to append the token (if available)
  const entryHeaders = new Headers();
  if (token) {
    entryHeaders.set("Authorization", token);
  }

  // Fetch the entry from the collection
  const entryRequest = await fetch(entryUrl.href, {
    headers: entryHeaders
  });

  // If the request was not successful, return an error
  if (!entryRequest.ok) {
    // If the entry is locked, a superuser token is required
    if (entryRequest.status === 403) {
      if (
        options.superuserCredentials &&
        "impersonateToken" in options.superuserCredentials
      ) {
        throw new Error("The given impersonate token is not valid.");
      } else {
        throw new Error(
          "The entry is not accessible without superuser rights. Please provide superuser credentials in the config."
        );
      }
    }

    // Get the reason for the error
    let errorMessage = `Fetching entry "${id}" from collection "${options.collectionName}" failed.`;
    try {
      const errorData = (await entryRequest.json()) as unknown;
      const parsedError = pocketbaseErrorResponseSchema.parse(errorData);
      errorMessage += `\nReason: ${parsedError.message}`;
    } catch {
      // If parsing fails, just use the basic error message
    }
    throw new Error(errorMessage);
  }

  // Get the data from the response
  const responseData = (await entryRequest.json()) as unknown;
  // Parse and validate as PocketBaseEntry, then cast to TEntry (which extends PocketBaseEntry)
  // This is safe because TEntry is constrained to extend PocketBaseEntry, and we've validated the core fields
  // oxlint-disable-next-line no-unsafe-type-assertion
  return pocketBaseEntrySchema.parse(responseData) as TEntry;
}
