import {
  LiveCollectionError,
  LiveEntryNotFoundError
} from "astro/content/runtime";
import { PocketBaseAuthenticationError } from "../types/errors";
import {
  pocketBaseErrorResponse,
  pocketBaseListResponse
} from "../types/pocketbase-api-response.type";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { PocketBaseLiveLoaderCollectionFilter } from "../types/pocketbase-live-loader-filter.type";
import type { PocketBaseLoaderBaseOptions } from "../types/pocketbase-loader-options.type";
import { combineFieldsForRequest } from "../utils/combine-fields-for-request";
import { formatFields } from "../utils/format-fields";

/**
 * Provides utilities to fetch entries from a PocketBase collection, supporting filtering and pagination.
 */
export type CollectionFilter = {
  /**
   * Date string to only fetch entries that have been modified since this date.
   * If not provided, all entries will be fetched.
   */
  lastModified?: string;
} & PocketBaseLiveLoaderCollectionFilter;

/**
 * Fetches entries from a PocketBase collection, optionally filtering by modification date and supporting pagination.
 */
export async function fetchCollection<TEntry extends PocketBaseEntry>(
  options: PocketBaseLoaderBaseOptions,
  chunkLoaded: (entries: Array<TEntry>) => Promise<void>,
  token: string | undefined,
  collectionFilter: CollectionFilter | undefined
): Promise<void> {
  // Build the URL for the collections endpoint
  const collectionUrl = new URL(
    `api/collections/${options.collectionName}/records`,
    options.url
  );

  // Create the headers for the request to append the token (if available)
  const collectionHeaders = new Headers();
  if (token) {
    collectionHeaders.set("Authorization", token);
  }

  // Cache fields computation outside the loop
  const fieldsArray = formatFields(options.fields);
  const combinedFields = combineFieldsForRequest(fieldsArray, options);

  // Prepare pagination variables
  let page = 0;
  let totalPages = 0;

  // Fetch all (modified) entries
  do {
    const searchParams = buildSearchParams(options, combinedFields, {
      ...collectionFilter,
      page: collectionFilter?.page ?? ++page,
      perPage: collectionFilter?.perPage ?? 100
    });

    // Apply search parameters to URL
    collectionUrl.search = searchParams.toString();

    // Fetch entries from the collection
    const collectionRequest = await fetch(collectionUrl.href, {
      headers: collectionHeaders
    });

    // If the request was not successful, print the error message and return
    if (!collectionRequest.ok) {
      // If the collection is locked, an superuser token is required
      if (collectionRequest.status === 403) {
        if (
          options.superuserCredentials &&
          "impersonateToken" in options.superuserCredentials
        ) {
          throw new PocketBaseAuthenticationError(
            options.collectionName,
            "The given impersonate token is not valid."
          );
        } else {
          throw new PocketBaseAuthenticationError(
            options.collectionName,
            "The collection is not accessible without superuser rights. Please provide superuser credentials in the config."
          );
        }
      }

      if (collectionRequest.status === 404) {
        throw new LiveEntryNotFoundError(options.collectionName, {
          ...collectionFilter
        });
      }

      // Get the reason for the error
      const errorResponse = pocketBaseErrorResponse.parse(
        await collectionRequest.json()
      );
      throw new LiveCollectionError(
        options.collectionName,
        errorResponse.message
      );
    }

    // Get the data from the response
    const response = pocketBaseListResponse.parse(
      await collectionRequest.json()
    );

    // Return current chunk
    // oxlint-disable-next-line no-unsafe-type-assertion
    await chunkLoaded(response.items as Array<TEntry>);

    // Update the page and total pages
    page = response.page;
    totalPages = response.totalPages;
  } while (!collectionFilter?.perPage && page < totalPages);
}

/**
 * Build search parameters for the PocketBase collection request.
 */
function buildSearchParams(
  loaderOptions: PocketBaseLoaderBaseOptions,
  combinedFields: Array<string> | undefined,
  collectionFilter: CollectionFilter
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (collectionFilter.page) {
    searchParams.set("page", `${collectionFilter.page}`);
  }

  if (collectionFilter.perPage) {
    searchParams.set("perPage", `${collectionFilter.perPage}`);
  }

  const filters = [];

  // If `lastModified` is set, only fetch entries that have been modified since the last fetch
  // Sort by the updated field and id
  if (collectionFilter.lastModified && loaderOptions.updatedField) {
    filters.push(
      `(${loaderOptions.updatedField}>"${collectionFilter.lastModified}")`
    );
    searchParams.set("sort", `-${loaderOptions.updatedField},id`);
  }

  // Add filter from the loader options
  if (loaderOptions.filter) {
    filters.push(`(${loaderOptions.filter})`);
  }

  // Add additional filter from the collection filter
  if (collectionFilter.filter) {
    filters.push(`(${collectionFilter.filter})`);
  }

  // Add filters to search parameters
  if (filters.length > 0) {
    searchParams.set("filter", filters.join("&&"));
  }

  if (collectionFilter.sort) {
    searchParams.set("sort", collectionFilter.sort);
  }

  // Add fields parameter if specified
  if (combinedFields) {
    searchParams.set("fields", combinedFields.join(","));
  }

  return searchParams;
}
