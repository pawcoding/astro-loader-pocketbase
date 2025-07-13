import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";

export async function fetchCollection(
  options: Pick<
    PocketBaseLoaderOptions,
    | "collectionName"
    | "url"
    | "updatedField"
    | "filter"
    | "superuserCredentials"
  >,
  chunkLoaded: (entries: Array<PocketBaseEntry>) => Promise<void>,
  token: string | undefined,
  lastModified: string | undefined
): Promise<void> {
  // Build the URL for the collections endpoint
  const collectionUrl = new URL(
    `api/collections/${options.collectionName}/records`,
    options.url
  ).href;

  // Create the headers for the request to append the token (if available)
  const collectionHeaders = new Headers();
  if (token) {
    collectionHeaders.set("Authorization", token);
  }

  // Prepare pagination variables
  let page = 0;
  let totalPages = 0;

  // Fetch all (modified) entries
  do {
    // Build search parameters
    const searchParams = new URLSearchParams({
      page: `${++page}`,
      perPage: "100"
    });

    const filters = [];
    if (lastModified && options.updatedField) {
      // If `lastModified` is set, only fetch entries that have been modified since the last fetch
      filters.push(`(${options.updatedField}>"${lastModified}")`);
      // Sort by the updated field and id
      searchParams.set("sort", `-${options.updatedField},id`);
    }
    if (options.filter) {
      filters.push(`(${options.filter})`);
    }

    // Add filters to search parameters
    if (filters.length > 0) {
      searchParams.set("filter", filters.join("&&"));
    }

    // Fetch entries from the collection
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
          throw new Error("The given impersonate token is not valid.");
        } else {
          throw new Error(
            "The collection is not accessible without superuser rights. Please provide superuser credentials in the config."
          );
        }
      }

      // Get the reason for the error
      const reason = await collectionRequest
        .json()
        .then((data) => data.message);
      const errorMessage = `Fetching data failed with status code ${collectionRequest.status}.\nReason: ${reason}`;
      throw new Error(errorMessage);
    }

    // Get the data from the response
    const response = await collectionRequest.json();

    // Return current chunk
    await chunkLoaded(response.items);

    // Update the page and total pages
    page = response.page;
    totalPages = response.totalPages;
  } while (page < totalPages);
}
