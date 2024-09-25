import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";
import type {
  PocketBaseCollection,
  PocketBaseSchemaEntry
} from "../types/pocketbase-schema.type";
import { getAdminToken } from "./get-admin-token";

/**
 * Fetches the schema for the specified collection from the PocketBase instance.
 *
 * @param options Options for the loader. See {@link PocketBaseLoaderOptions} for more details.
 */
export async function getRemoteSchema(
  options: PocketBaseLoaderOptions
): Promise<Array<PocketBaseSchemaEntry> | undefined> {
  if (!options.adminEmail || !options.adminPassword) {
    return undefined;
  }

  // Get the admin token
  const token = await getAdminToken(
    options.url,
    options.adminEmail,
    options.adminPassword
  );

  // If the token is invalid, return the basic schema
  if (!token) {
    return undefined;
  }

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

  // If the request was not successful, return the basic schema
  if (!schemaRequest.ok) {
    const reason = await schemaRequest.json().then((data) => data.message);
    const errorMessage = `Fetching schema from ${options.collectionName} failed with status code ${schemaRequest.status}.\nReason: ${reason}`;
    console.error(errorMessage);

    return undefined;
  }

  // Get the schema from the response
  const schema: PocketBaseCollection = await schemaRequest.json();
  return schema.schema;
}
