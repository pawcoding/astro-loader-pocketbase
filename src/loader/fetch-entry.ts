import {
  LiveCollectionError,
  LiveEntryNotFoundError
} from "astro/content/runtime";
import { PocketBaseAuthenticationError } from "../types/errors";
import { pocketBaseErrorResponse } from "../types/pocketbase-api-response.type";
import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import { pocketBaseEntry } from "../types/pocketbase-entry.type";
import type {
  ExperimentalPocketBaseLiveLoaderOptions,
  PocketBaseLoaderOptions
} from "../types/pocketbase-loader-options.type";
import { combineFieldsForRequest } from "../utils/combine-fields-for-request";
import { formatExpand } from "../utils/format-expand";
import { formatFields } from "../utils/format-fields";

/**
 * Retrieves a specific entry from a PocketBase collection using its ID and loader options.
 */
export async function fetchEntry<TEntry extends PocketBaseEntry>(
  id: string,
  options: PocketBaseLoaderOptions | ExperimentalPocketBaseLiveLoaderOptions,
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

  // Add expand parameter if specified in experimental options
  if (options.experimental && "expand" in options.experimental) {
    const expandString = formatExpand(
      options.experimental.expand,
      options.collectionName
    );
    if (expandString) {
      entryUrl.searchParams.set("expand", expandString);
    }
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
        throw new PocketBaseAuthenticationError(
          options.collectionName,
          "The given impersonate token is not valid."
        );
      } else {
        throw new PocketBaseAuthenticationError(
          options.collectionName,
          "The entry is not accessible without superuser rights. Please provide superuser credentials in the config."
        );
      }
    }

    if (entryRequest.status === 404) {
      throw new LiveEntryNotFoundError(options.collectionName, id);
    }

    // Get the reason for the error
    const errorResponse = pocketBaseErrorResponse.parse(
      await entryRequest.json()
    );
    throw new LiveCollectionError(
      options.collectionName,
      errorResponse.message
    );
  }

  // Get the data from the response
  const response = pocketBaseEntry.parse(await entryRequest.json());
  // oxlint-disable-next-line no-unsafe-type-assertion
  return response as TEntry;
}
