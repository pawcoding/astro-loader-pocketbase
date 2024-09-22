import type { ZodSchema } from "astro/zod";
import { z } from "astro/zod";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";
import { getRemoteSchema } from "./utils/get-remote-schema";
import { parseSchema } from "./utils/parse-schema";
import { readLocalSchema } from "./utils/read-local-schema";

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
  let schema: Array<Record<string, any>> | undefined;

  // Try to get the schema directly from the PocketBase instance
  schema = await getRemoteSchema(options);

  // If the schema is not available, try to read it from a local schema file
  if (!schema && options.localSchema) {
    schema = await readLocalSchema(options.localSchema, options.collectionName);
  }

  // If the schema is still not available, return the basic schema
  if (!schema) {
    console.error(
      `No schema available for ${options.collectionName}. Only basic types are available. Please check your configuration and provide a valid schema file or admin credentials.`
    );
    return z.object(BASIC_SCHEMA);
  }

  // Parse the schema
  const fields = parseSchema(schema);

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
