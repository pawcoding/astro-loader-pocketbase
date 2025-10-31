import type { ZodSchema } from "astro/zod";
import { z } from "astro/zod";
import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";
import type { PocketBaseCollection } from "../types/pocketbase-schema.type";
import { combineFieldsForRequest } from "../utils/combine-fields-for-request";
import { extractFieldNames } from "../utils/extract-field-names";
import { formatFields } from "../utils/format-fields";
import { getRemoteSchema } from "./get-remote-schema";
import { parseSchema, parseSingleOrMultipleValues } from "./parse-schema";
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

  // Get fields to include from options
  const formattedFields = formatFields(options.fields);
  const fieldNames = extractFieldNames(formattedFields);
  const fieldsToInclude = combineFieldsForRequest(fieldNames, options);

  // Parse the schema with optional field filtering
  const fields = parseSchema(collection, options.jsonSchemas, {
    hasSuperuserRights,
    improveTypes: options.improveTypes,
    fieldsToInclude,
    experimentalLiveTypesOnly: options.experimental?.liveTypesOnly
  });

  // Do some sanity checks on the provided options
  checkCustomIdField(collection, options);
  checkContentField(fields, options);
  checkUpdatedField(fields, collection, options);

  // Combine the basic schema with the parsed fields
  const schemaShape = {
    ...BASIC_SCHEMA,
    ...fields
  };

  // Generate schema for expanded fields
  const expandSchema = await generateExpandSchema(collection, options, token);
  if (expandSchema) {
    // @ts-expect-error - "expand" is not known yet
    schemaShape["expand"] = z.optional(z.object(expandSchema));
  }

  const schema = z.object(schemaShape);

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

/**
 * Generate schema for expanded fields
 */
async function generateExpandSchema(
  collection: PocketBaseCollection,
  options: PocketBaseLoaderOptions,
  token: string | undefined
): Promise<Record<string, z.ZodType> | undefined> {
  if (
    !options.experimental?.expand ||
    options.experimental.expand.length === 0
  ) {
    return undefined;
  }

  const expandedFields: Record<string, z.ZodType> = {};

  for (const field of options.experimental.expand) {
    const fields = field.split(".");
    if (fields.length > 6) {
      throw new Error(
        `Expand value ${field} is not valid, since it exceeds 6 levels of depth. This is not supported by PocketBase.`
      );
    }

    const currentField = fields.at(0);
    if (!currentField) {
      throw new Error(`Expand value ${field} contains an empty block`);
    }

    const fieldDefinition = collection.fields.find(
      (field) => field.name === currentField
    );
    if (
      !fieldDefinition ||
      fieldDefinition.type !== "relation" ||
      !fieldDefinition.collectionId
    ) {
      throw new Error(
        `The provided field ${currentField} in ${field} does not exist or has no associated collection. Thus the field cannot be expanded.`
      );
    }

    const deeperFields =
      fields.length > 1 ? fields.slice(1).join(".") : undefined;
    const schema = await generateSchema(
      {
        ...options,
        collectionName: fieldDefinition.collectionId,
        experimental: {
          ...options.experimental,
          expand: deeperFields
        }
      },
      token
    );

    let fieldType = parseSingleOrMultipleValues(fieldDefinition, schema);
    if (!fieldDefinition.required) {
      fieldType = z.preprocess(
        (val) => val || undefined,
        z.optional(fieldType)
      );
    }
    expandedFields[currentField] = fieldType;
  }

  return expandedFields;
}

/**
 * Check if the custom id field is present
 */
function checkCustomIdField(
  collection: PocketBaseCollection,
  options: PocketBaseLoaderOptions
): void {
  if (!options.idField) {
    return;
  }

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

/**
 * Check if the content field(s) are present
 */
function checkContentField(
  fields: Record<string, z.ZodType>,
  options: PocketBaseLoaderOptions
): void {
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
}

/**
 * Check if the updated field is present
 */
function checkUpdatedField(
  fields: Record<string, z.ZodType>,
  collection: PocketBaseCollection,
  options: PocketBaseLoaderOptions
): void {
  if (!options.updatedField) {
    return;
  }

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
