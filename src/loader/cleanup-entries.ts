import type { LoaderContext } from "astro/loaders";
import { z } from "astro/zod";
import {
  pocketbaseErrorResponseSchema,
  pocketbaseMinimalListResponseSchema
} from "../types/pocketbase-api-responses.type";
import type { PocketBaseLoaderBaseOptions } from "../types/pocketbase-loader-options.type";

/**
 * Cleanup entries that are no longer in the collection.
 *
 * @param options Options for the loader.
 * @param context Context of the loader.
 * @param superuserToken Superuser token to access all resources.
 */
export async function cleanupEntries(
  options: PocketBaseLoaderBaseOptions,
  context: LoaderContext,
  superuserToken: string | undefined
): Promise<void> {
  // Build the URL for the collections endpoint
  const collectionUrl = new URL(
    `api/collections/${options.collectionName}/records`,
    options.url
  ).href;

  // Create the headers for the request to append the superuser token (if available)
  const collectionHeaders = new Headers();
  if (superuserToken) {
    collectionHeaders.set("Authorization", superuserToken);
  }

  // Prepare pagination variables
  let page = 0;
  let totalPages = 0;
  const entries = new Set<string>();

  // Fetch all ids of the collection
  do {
    // Build search parameters
    const searchParams = new URLSearchParams({
      page: `${++page}`,
      perPage: "1000",
      fields: "id"
    });

    if (options.filter) {
      // If a filter is set, add it to the search parameters
      searchParams.set("filter", `(${options.filter})`);
    }

    // Fetch ids from the collection
    const collectionRequest = await fetch(
      `${collectionUrl}?${searchParams.toString()}`,
      {
        headers: collectionHeaders
      }
    );

    // If the request was not successful, print the error message and return
    if (!collectionRequest.ok) {
      // If the collection is locked, an superuser token is required
      if (collectionRequest.status === 403) {
        if (
          options.superuserCredentials &&
          "impersonateToken" in options.superuserCredentials
        ) {
          context.logger.error("The given impersonate token is not valid.");
        } else {
          context.logger.error(
            "The collection is not accessible without superuser rights. Please provide superuser credentials in the config."
          );
        }
      } else {
        let errorMessage = `Fetching ids failed with status code ${collectionRequest.status}.`;
        try {
          const errorData = (await collectionRequest.json()) as unknown;
          const parsedError = pocketbaseErrorResponseSchema.parse(errorData);
          errorMessage += `\nReason: ${parsedError.message}`;
        } catch {
          // If parsing fails, just use the status code message
        }
        context.logger.error(errorMessage);
      }

      // Remove all entries from the store
      context.logger.info(`Removing all entries from the store.`);
      context.store.clear();
      return;
    }

    // Get the data from the response
    const responseData = (await collectionRequest.json()) as unknown;
    // Use minimal schema here since we only request the id field
    const parsedResponse =
      pocketbaseMinimalListResponseSchema.parse(responseData);

    // Add the ids to the set
    for (const item of parsedResponse.items) {
      const itemId = z.string().parse(z.record(z.unknown()).parse(item).id);
      entries.add(itemId);
    }

    // Update the page and total pages
    page = parsedResponse.page;
    totalPages = parsedResponse.totalPages;
  } while (page < totalPages);

  let cleanedUp = 0;

  // Create a mapping from PocketBase IDs to store keys for proper cleanup
  const storedIds = new Map<string, string>(
    context.store
      .values()
      .map((entry) => [
        z.string().parse(z.record(z.unknown()).parse(entry.data).id),
        entry.id
      ])
  );

  // Check which PocketBase IDs are missing from the server response
  for (const [pocketbaseId, storeKey] of storedIds.entries()) {
    // If the PocketBase ID is not in the entries set, remove the entry from the store
    if (!entries.has(pocketbaseId)) {
      context.store.delete(storeKey);
      cleanedUp++;
    }
  }

  if (cleanedUp > 0) {
    // Log the number of cleaned up entries
    context.logger.info(`Cleaned up ${cleanedUp} old entries.`);
  }
}
