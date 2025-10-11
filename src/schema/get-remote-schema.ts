import { pocketBaseErrorResponse } from "../types/pocketbase-api-response.type";
import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";
import type { PocketBaseCollection } from "../types/pocketbase-schema.type";
import { pocketBaseCollection } from "../types/pocketbase-schema.type";

/**
 * Fetches the schema for the specified collection from the PocketBase instance.
 *
 * @param options Options for the loader. See {@link PocketBaseLoaderOptions} for more details.
 * @param token The superuser token to authenticate the request.
 */
export async function getRemoteSchema(
  options: Pick<PocketBaseLoaderOptions, "collectionName" | "url">,
  token: string
): Promise<PocketBaseCollection | undefined> {
  // Build URL and headers for the schema request
  const schemaUrl = new URL(
    `api/collections/${options.collectionName}`,
    options.url
  ).href;
  const schemaHeaders = new Headers();
  schemaHeaders.set("Authorization", token);

  // Fetch the schema
  const schemaRequest = await fetch(schemaUrl, {
    headers: schemaHeaders
  });

  // If the request was not successful, try another method
  if (!schemaRequest.ok) {
    const errorResponse = pocketBaseErrorResponse.parse(
      await schemaRequest.json()
    );
    const errorMessage = `Fetching schema from ${options.collectionName} failed with status code ${schemaRequest.status}.\nReason: ${errorResponse.message}`;
    console.error(errorMessage);

    return undefined;
  }

  // Get the schema from the response
  const response = pocketBaseCollection.parse(await schemaRequest.json());
  return response;
}
