import type { ZodSchema } from "astro/zod";
import { z } from "astro/zod";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";
import type { PocketBaseCollection } from "./types/pocketbase-schema.type";
import { getRemoteSchema } from "./utils/get-remote-schema";
import { parseSchema } from "./utils/parse-schema";
import { readLocalSchema } from "./utils/read-local-schema";
import { transformFiles } from "./utils/transform-files";

/**
 * Basic schema for every PocketBase collection.
 */
const BASIC_SCHEMA = {
  id: z.string(),
  collectionId: z.string().length(15),
  collectionName: z.string(),
  created: z.coerce.date(),
  updated: z.coerce.date()
};

/**
 * Basic schema for a view in PocketBase.
 */
const VIEW_SCHEMA = {
  id: z.string(),
  collectionId: z.string().length(15),
  collectionName: z.string(),
  created: z.preprocess((val) => val || undefined, z.optional(z.coerce.date())),
  updated: z.preprocess((val) => val || undefined, z.optional(z.coerce.date()))
};

/**
 * Types of fields that can be used as an ID.
 */
const VALID_ID_TYPES = ["text", "number", "email", "url", "date"];

/**
 * Generate a schema for the collection based on the collection's schema in PocketBase.
 * By default, a basic schema is returned if no other schema is available.
 * If admin credentials are provided, the schema is fetched from the PocketBase API.
 * If a path to a local schema file is provided, the schema is read from the file.
 *
 * @param options Options for the loader. See {@link PocketBaseLoaderOptions} for more details.
 */
export async function generateSchema(
  options: PocketBaseLoaderOptions
): Promise<ZodSchema> {
  let collection: PocketBaseCollection | undefined;

  // Try to get the schema directly from the PocketBase instance
  collection = await getRemoteSchema(options);

  // If the schema is not available, try to read it from a local schema file
  if (!collection && options.localSchema) {
    collection = await readLocalSchema(
      options.localSchema,
      options.collectionName
    );
  }

  // If the schema is still not available, return the basic schema
  if (!collection) {
    console.error(
      `No schema available for ${options.collectionName}. Only basic types are available. Please check your configuration and provide a valid schema file or admin credentials.`
    );
    // Return the view schema since every collection has at least the view schema
    return z.object(VIEW_SCHEMA);
  }

  // Parse the schema
  const fields = parseSchema(collection, options.jsonSchemas);

  // Check if custom id field is present
  if (options.id) {
    // Find the id field in the schema
    const idField = collection.schema.find(
      (field) => field.name === options.id
    );

    // Check if the id field is present and of a valid type
    if (!idField) {
      console.error(
        `The id field "${options.id}" is not present in the schema of the collection "${options.collectionName}".`
      );
    } else if (!VALID_ID_TYPES.includes(idField.type)) {
      console.error(
        `The id field "${options.id}" for collection "${
          options.collectionName
        }" is of type "${
          idField.type
        }" which is not recommended. Please use one of the following types: ${VALID_ID_TYPES.join(
          ", "
        )}.`
      );
    }
  }

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

  // Use the corresponding base schema for the type of collection
  // Auth collections are basically a superset of the basic schema.
  const base = collection.type === "view" ? VIEW_SCHEMA : BASIC_SCHEMA;

  // Combine the basic schema with the parsed fields
  const schema = z.object({
    ...base,
    ...fields
  });

  // Get all file fields
  const fileFields = collection.schema.filter((field) => field.type === "file");

  if (fileFields.length === 0) {
    return schema;
  }

  // Transform file names to file urls
  return schema.transform((entry) =>
    // @ts-expect-error - `updated` and `created` are already transformed to dates
    transformFiles(options.url, fileFields, entry)
  );
}
