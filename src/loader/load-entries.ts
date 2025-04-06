import type { LoaderContext } from "astro/loaders";
import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";
import { parseEntry } from "./parse-entry";

/**
 * Load (modified) entries from a PocketBase collection.
 *
 * @param options Options for the loader.
 * @param context Context of the loader.
 * @param superuserToken Superuser token to access all resources.
 * @param lastModified Date of the last fetch to only update changed entries.
 *
 * @returns `true` if the collection has an updated column, `false` otherwise.
 */
export async function loadEntries(
  options: PocketBaseLoaderOptions,
  context: LoaderContext,
  superuserToken: string | undefined,
  lastModified: string | undefined
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

  // Log the fetching of the entries
  context.logger.info(
    `Fetching${lastModified ? " modified" : ""} data${
      lastModified ? ` starting at ${lastModified}` : ""
    }${superuserToken ? " as superuser" : ""}`
  );

  // Prepare pagination variables
  let page = 0;
  let totalPages = 0;
  let entries = 0;

  // Fetch all (modified) entries
  do {
    // build search query
    const searchQuery = new URLSearchParams({
      page: `${++page}`,
      perPage: "100"
    });

    // add filter if key exists
    if (options.filter) searchQuery.set("filter", options.filter);

    // If `lastModified` is set, only fetch entries that have been modified since the last fetch
    // combine updatedField and custom filter
    if (lastModified && options.updatedField) {
      const customFilter = options.filter ? `&&(${options.filter})` : "";
      searchQuery.set(
        "filter",
        `(${options.updatedField}>"${lastModified}"${customFilter})`
      );
      searchQuery.set("sort", `-${options.updatedField}`);
    }

    // Fetch entries from the collection
    const collectionRequest = await fetch(
      `${collectionUrl}?${searchQuery.toString()}`,
      {
        headers: collectionHeaders
      }
    );

    // If the request was not successful, print the error message and return
    if (!collectionRequest.ok) {
      // If the collection is locked, an superuser token is required
      if (collectionRequest.status === 403) {
        throw new Error(
          `The collection is not accessible without superuser rights. Please provide superuser credentials in the config.`
        );
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

    // Parse and store the entries
    for (const entry of response.items) {
      await parseEntry(entry, context, options);
    }

    // Update the page and total pages
    page = response.page;
    totalPages = response.totalPages;
    entries += response.items.length;
  } while (page < totalPages);

  // Log the number of fetched entries
  if (lastModified) {
    context.logger.info(
      `Updated ${entries}/${context.store.keys().length} entries.`
    );
  } else {
    context.logger.info(`Fetched ${entries} entries.`);
  }
}
