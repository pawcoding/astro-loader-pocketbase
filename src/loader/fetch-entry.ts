import type { PocketBaseEntry } from "../types/pocketbase-entry.type";
import type { ExperimentalPocketBaseLiveLoaderOptions } from "../types/pocketbase-loader-options.type";

export async function fetchEntry<TEntry extends PocketBaseEntry>(
  id: string,
  options: ExperimentalPocketBaseLiveLoaderOptions,
  token: string | undefined
): Promise<TEntry> {
  // Build the URL for the entry endpoint
  const entryUrl = new URL(
    `api/collections/${options.collectionName}/records/${id}`,
    options.url
  ).href;

  // Create the headers for the request to append the token (if available)
  const entryHeaders = new Headers();
  if (token) {
    entryHeaders.set("Authorization", token);
  }

  console.log(entryUrl);

  // Fetch the entry from the collection
  const entryRequest = await fetch(entryUrl, {
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
    const reason = await entryRequest.json().then((data) => data.message);
    const errorMessage = `Fetching entry "${id}" from collection "${options.collectionName}" failed.\nReason: ${reason}`;
    throw new Error(errorMessage);
  }

  // Get the data from the response
  const response = await entryRequest.json();

  return response;
}
