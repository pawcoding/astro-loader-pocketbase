import { z } from "astro/zod";
import type {
  PocketBaseCollection,
  PocketBaseSchemaEntry
} from "../types/pocketbase-schema.type";

/**
 * Converts PocketBase collection fields into Zod types, handling field types, required status, and custom schemas.
 */
export function parseSchema(
  collection: PocketBaseCollection,
  customSchemas: Record<string, z.ZodType> | undefined,
  hasSuperuserRights: boolean,
  improveTypes: boolean,
  experimentalLiveTypesOnly?: boolean,
  fieldsToInclude?: Array<string>
): Record<string, z.ZodType> {
  // Prepare the schemas fields
  const fields: Record<string, z.ZodType> = {};

  // Parse every field in the schema
  for (const field of collection.fields) {
    // Skip hidden fields if the user does not have superuser rights
    if (field.hidden && !hasSuperuserRights) {
      continue;
    }

    // If fieldsToInclude is specified, only include fields that are in the list
    if (fieldsToInclude && !fieldsToInclude.includes(field.name)) {
      continue;
    }

    let fieldType;

    // Determine the field type and create the corresponding Zod type
    switch (field.type) {
      case "number":
        fieldType = z.number();
        break;
      case "bool":
        fieldType = z.boolean();
        break;
      case "date":
      case "autodate":
        if (experimentalLiveTypesOnly) {
          // If experimental live types only mode is enabled, treat dates as strings
          fieldType = z.string();
          break;
        }
        // Coerce and parse the value as a date
        fieldType = z.coerce.date();
        break;
      case "geoPoint":
        fieldType = z.object({
          lon: z.number(),
          lat: z.number()
        });
        break;
      case "select": {
        if (!field.values) {
          throw new Error(
            `Field ${field.name} is of type "select" but has no values defined.`
          );
        }

        // Create an enum for the select values
        // @ts-expect-error - Zod complains because the values are not known at compile time and thus the array is not static.
        const values = z.enum(field.values);

        // Parse the field type based on the number of values it can have
        fieldType = parseSingleOrMultipleValues(field, values);
        break;
      }
      case "relation":
      case "file":
        // NOTE: Relations are currently not supported and are treated as strings
        // NOTE: Files are later transformed to URLs

        // Parse the field type based on the number of values it can have
        fieldType = parseSingleOrMultipleValues(field, z.string());
        break;
      case "json":
        if (customSchemas && customSchemas[field.name]) {
          // Use the user defined custom schema for the field
          fieldType = customSchemas[field.name];
        } else {
          // Parse the field as unknown JSON
          fieldType = z.unknown();
        }
        break;
      default:
        // Default to a string
        fieldType = z.string();
        break;
    }

    const isRequired =
      // Check if the field is required
      field.required ||
      // `onCreate autodate` fields are always set
      (field.type === "autodate" && field.onCreate) ||
      // Improve number and boolean types by providing default values
      (improveTypes && (field.type === "number" || field.type === "bool"));

    // If the field is not required, mark it as optional
    if (!isRequired) {
      fieldType = z.preprocess(
        (val) => val || undefined,
        z.optional(fieldType)
      );
    }

    // Add the field to the fields object
    fields[field.name] = fieldType;
  }

  return fields;
}

/**
 * Parse the field type based on the number of values it can have
 *
 * @param field Field to parse
 * @param type Type of each value
 *
 * @returns The parsed field type
 */
function parseSingleOrMultipleValues(
  field: PocketBaseSchemaEntry,
  type: z.ZodType
): z.ZodType {
  // If the select allows multiple values, create an array of the enum
  if (field.maxSelect === undefined || field.maxSelect === 1) {
    return type;
  }

  return z.array(type);
}
