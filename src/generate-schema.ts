import type { ZodSchema } from "astro/zod";
import { z } from "astro/zod";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";
import { getAdminToken } from "./utils/get-admin-token";
import { parseSchema } from "./utils/parse-schema";

/**
 * Basic schema for every PocketBase collection.
 */
const BASIC_SCHEMA = {
  id: z.string().length(15),
  collectionId: z.string().length(15),
  collectionName: z.string(),
  created: z.date({ coerce: true }),
  updated: z.date({ coerce: true })
};

/**
 * Generate a schema for the collection based on the collection's schema in PocketBase.
 * If no login credentials are provided, a {@link BASIC_SCHEMA} for every PocketBase collection is returned.
 *
 * @param options Options for the loader. See {@link PocketBaseLoaderOptions} for more details.
 */
export async function generateSchema(
  options: PocketBaseLoaderOptions
): Promise<ZodSchema> {
  // TODO: Add support for local schema files

  // If no admin email and password are provided, we can't get the schema from the API
  if (!options.adminEmail || !options.adminPassword) {
    console.warn(
      "Make sure to add an admin email and password to the config to get automatic type generation."
    );

    // Return the basic schema
    return z.object(BASIC_SCHEMA);
  }

  // Get the admin token
  const token = await getAdminToken(
    options.url,
    options.adminEmail,
    options.adminPassword
  );

  // If the token is invalid, return the basic schema
  if (!token) {
    return z.object(BASIC_SCHEMA);
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

    return z.object(BASIC_SCHEMA);
  }

  // Get the schema from the response
  const schema = await schemaRequest.json();

  // Parse the schema
  const fields = parseSchema(schema.schema);

  // Check if the content field is present
  if (typeof options.content === "string" && !fields[options.content]) {
    console.error(
      `The content field "${options.content}" is not present in the schema of the collection "${options.collectionName}".`
    );
  } else if (Array.isArray(options.content)) {
    for (const field of options.content) {
      if (!fields[field]) {
        console.error(
          `The content field "${field}" is not present in the schema of the collection "${options.collectionName}".`
        );
      }
    }
  }

  // Combine the basic schema with the parsed fields
  return z.object({
    ...BASIC_SCHEMA,
    ...fields
  });
}
