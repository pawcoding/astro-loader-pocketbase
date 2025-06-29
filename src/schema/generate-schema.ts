import type { ZodObject, ZodSchema } from "astro/zod";
import { z } from "astro/zod";
import type {
  ExpandedFields,
  PocketBaseCollection
} from "../types/pocketbase-collection.type";
import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";
import { getRemoteSchema } from "./get-remote-schema";
import { parseSchema } from "./parse-schema";
import { readLocalSchema } from "./read-local-schema";
import { transformFiles } from "./transform-files";

/**
 * Basic schema for every PocketBase collection.
 */
const BASIC_SCHEMA = {
  id: z.string(),
  collectionId: z.string(),
  collectionName: z.string()
};

/**
 * Types of fields that can be used as an ID.
 */
const VALID_ID_TYPES = ["text", "number", "email", "url", "date"];

/**
 * Generate a schema for the collection based on the collection's schema in PocketBase.
 * By default, a basic schema is returned if no other schema is available.
 * If superuser credentials are provided, the schema is fetched from the PocketBase API.
 * If a path to a local schema file is provided, the schema is read from the file.
 *
 * @param options Options for the loader. See {@link PocketBaseLoaderOptions} for more details.
 */
export async function generateSchema(
  options: PocketBaseLoaderOptions
): Promise<ZodSchema> {
  let collection: PocketBaseCollection | undefined;
  const expandedFields: ExpandedFields = {};

  // Try to get the schema directly from the PocketBase instance
  collection = await getRemoteSchema(options);

  const hasSuperuserRights = !!collection || !!options.superuserCredentials;

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
      `No schema available for "${options.collectionName}". Only basic types are available. Please check your configuration and provide a valid schema file or superuser credentials.`
    );
    // Return the basic schema since every collection has at least these fields
    return z.object(BASIC_SCHEMA);
  }

  // Parse the schema
  const fields = parseSchema(
    collection,
    options.jsonSchemas,
    hasSuperuserRights,
    options.improveTypes ?? false
  );

  // Check if custom id field is present
  if (options.idField) {
    // Find the id field in the schema
    const idField = collection.fields.find(
      (field) => field.name === options.idField
    );

    // Check if the id field is present and of a valid type
    if (!idField) {
      console.error(
        `The id field "${options.idField}" is not present in the schema of the collection "${options.collectionName}".`
      );
    } else if (!VALID_ID_TYPES.includes(idField.type)) {
      console.error(
        `The id field "${options.idField}" for collection "${
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
  if (
    typeof options.contentFields === "string" &&
    !fields[options.contentFields]
  ) {
    console.error(
      `The content field "${options.contentFields}" is not present in the schema of the collection "${options.collectionName}".`
    );
  } else if (Array.isArray(options.contentFields)) {
    for (const field of options.contentFields) {
      if (!fields[field]) {
        console.error(
          `The content field "${field}" is not present in the schema of the collection "${options.collectionName}".`
        );
      }
    }
  }

  // Check if the updated field is present
  if (options.updatedField) {
    if (!fields[options.updatedField]) {
      console.error(
        `The field "${options.updatedField}" is not present in the schema of the collection "${options.collectionName}".\nThis will lead to errors when trying to fetch only updated entries.`
      );
    } else {
      const updatedField = collection.fields.find(
        (field) => field.name === options.updatedField
      );
      if (
        !updatedField ||
        updatedField.type !== "autodate" ||
        !updatedField.onUpdate
      ) {
        console.warn(
          `The field "${options.updatedField}" is not of type "autodate" with the value "Update" or "Create/Update".\nMake sure that the field is automatically updated when the entry is updated!`
        );
      }
    }
  }

  if (options.expand) {
    for (const expandedFieldName of options.expand) {
      const expandedFieldDefinition = collection.fields.find(
        (field) => field.name === expandedFieldName
      );

      if (!expandedFieldDefinition) {
        console.error(
          `The provided field in the expand property "${expandedFieldName}" is not present in the schema of the collection "${options.collectionName}".\nThis will lead to use unable to provide a definition for this field.`
        );
      } else {
        if (!expandedFieldDefinition.collectionId) {
          console.error(
            `The provided field in the expand property "${expandedFieldName}" does not have an associated collection linked to it, we need this in order to know the shape of the related schema.`
          );
        } else {
          const expandedSchema = await generateSchema({
            collectionName: expandedFieldDefinition.collectionId,
            superuserCredentials: options.superuserCredentials,
            localSchema: options.localSchema,
            jsonSchemas: options.jsonSchemas,
            improveTypes: options.improveTypes,
            url: options.url
          });

          expandedFields[expandedFieldName] = z.union([
            expandedchema,
            z.array(expandedchema)
          ]);
        }
      }
    }
  }

  const expandSchema = {
    expand: buildExpandSchema(expandedFields).optional()
  };

  const schema = z.object({
    ...BASIC_SCHEMA,
    ...fields,
    ...expandSchema
  });

  // Get all file fields
  const fileFields = collection.fields
    .filter((field) => field.type === "file")
    // Only show hidden fields if the user has superuser rights
    .filter((field) => !field.hidden || hasSuperuserRights);

  if (fileFields.length === 0) {
    return schema;
  }

  // Transform file names to file urls
  return schema.transform((entry) => {
    if (Array.isArray(entry)) {
      return entry.map((e) => transformFiles(options.url, fileFields, e));
    }

    return transformFiles(options.url, fileFields, entry);
  });
}

/**
 * Builds a Zod object schema from expandedFields, where each property is either a ZodSchema or an array of ZodSchema.
 */
export function buildExpandSchema(
  expandedFields: ExpandedFields
): ZodObject<Record<string, ZodSchema | z.ZodArray<ZodSchema>>> {
  const shape: Record<string, ZodSchema | z.ZodArray<ZodSchema>> = {};

  for (const key in expandedFields) {
    const value = expandedFields[key];
    if (Array.isArray(value)) {
      // If it's an array, wrap the first element as a ZodArray (assuming all elements are the same schema)
      shape[key] = z.array(value[0]);
    } else {
      shape[key] = value;
    }
  }

  return z.object(shape);
}
