import type { ZodSchema } from "astro/zod";
import { z } from "astro/zod";
import type { PocketBaseCollection } from "../types/pocketbase-collection.type";
import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";
import { getRemoteSchema } from "./get-remote-schema";
import { parseExpandedSchemaField, parseSchema } from "./parse-schema";
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
 * @param token The superuser token to authenticate the request.
 */
export async function generateSchema(
  options: PocketBaseLoaderOptions,
  token: string | undefined
): Promise<ZodSchema> {
  let collection: PocketBaseCollection | undefined;
  const expandedFields: Record<string, z.ZodType> = {};

  if (token) {
    // Try to get the schema directly from the PocketBase instance
    collection = await getRemoteSchema(options, token);
  }

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

  if (options.expand && options.expand.length > 0) {
    for (const expandedFieldName of options.expand) {
      const [currentLevelFieldName, ...deeperExpandFields] =
        getCurrentLevelExpandedFieldName(expandedFieldName);

      const expandedFieldDefinition = collection.fields.find(
        (field) => field.name === currentLevelFieldName
      );

      if (!expandedFieldDefinition) {
        throw new Error(
          `The provided field in the expand property "${expandedFieldName}" is not present in the schema of the collection "${options.collectionName}".\nThis will lead to use unable to provide a definition for this field.`
        );
      }

      if (!expandedFieldDefinition.collectionId) {
        throw new Error(
          `The provided field in the expand property "${expandedFieldName}" does not have an associated collection linked to it, we need this in order to know the shape of the related schema.`
        );
      }

      const expandedSchema = await generateSchema(
        {
          collectionName: expandedFieldDefinition.collectionId,
          superuserCredentials: options.superuserCredentials,
          expand: deeperExpandFields.length ? deeperExpandFields : undefined,
          localSchema: options.localSchema,
          jsonSchemas: options.jsonSchemas,
          improveTypes: options.improveTypes,
          url: options.url
        },
        token
      );

      expandedFields[expandedFieldName] = parseExpandedSchemaField(
        expandedFieldDefinition,
        expandedSchema
      );
    }
  }

  const schema = z.object({
    ...BASIC_SCHEMA,
    ...fields,
    expand: z.optional(z.object(expandedFields))
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
  return schema.transform((entry) =>
    transformFiles(options.url, fileFields, entry)
  );
}

function getCurrentLevelExpandedFieldName(s: string): Array<string> {
  const fields = s.split(".");

  if (fields.length >= 7) {
    throw new Error(
      `Expand value ${s} exceeds 6 levels of depth that Pocketbase allows`
    );
  }

  return fields;
}
