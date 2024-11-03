import type { LoaderContext } from "astro/loaders";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";

/**
 * Cleanup entries that are no longer in the collection.
 *
 * @param options Options for the loader.
 * @param context Context of the loader.
 * @param adminToken Admin token to access all resources.
 */
export async function cleanupEntries(
  options: PocketBaseLoaderOptions,
  context: LoaderContext,
  adminToken: string | undefined
): Promise<void> {
  // Build the URL for the collections endpoint
  const collectionUrl = new URL(
    `api/collections/${options.collectionName}/records`,
    options.url
  ).href;

  // Create the headers for the request to append the admin token (if available)
  const collectionHeaders = new Headers();
  if (adminToken) {
    collectionHeaders.set("Authorization", adminToken);
  }

  // Prepare pagination variables
  let page = 0;
  let totalPages = 0;
  const entries = new Set<string>();

  // Fetch all ids of the collection
  do {
    // Fetch ids from the collection
    const collectionRequest = await fetch(
      `${collectionUrl}?page=${++page}&perPage=1000&fields=id`,
      {
        headers: collectionHeaders
      }
    );

    // If the request was not successful, print the error message and return
    if (!collectionRequest.ok) {
      // If the collection is locked, an admin token is required
      if (collectionRequest.status === 403) {
        context.logger.error(
          `The collection ${options.collectionName} is not accessible without an admin rights. Please provide an admin email and password in the config.`
        );
        return;
      }

      const reason = await collectionRequest
        .json()
        .then((data) => data.message);
      const errorMessage = `Fetching ids from ${options.collectionName} failed with status code ${collectionRequest.status}.\nReason: ${reason}`;
      context.logger.error(errorMessage);
      return;
    }

    // Get the data from the response
    const response = await collectionRequest.json();

    // Add the ids to the set
    for (const item of response.items) {
      entries.add(item.id);
    }

    // Update the page and total pages
    page = response.page;
    totalPages = response.totalPages;
  } while (page < totalPages);

  let cleanedUp = 0;

  // Get all ids of the entries in the store
  const storedIds = context.store.values().map((entry) => entry.data.id) as Array<string>;
  for (const id of storedIds) {
    // If the id is not in the entries set, remove the entry from the store
    if (!entries.has(id)) {
      context.store.delete(id);
      cleanedUp++;
    }
  }

  if (cleanedUp > 0) {
    // Log the number of cleaned up entries
    context.logger.info(
      `Cleaned up ${cleanedUp} old entries for ${context.collection}`
    );
  }
}
