import { z } from "astro/zod";
import type {
  PocketBaseCollection,
  PocketBaseSchemaEntry
} from "../types/pocketbase-schema.type";

export function parseSchema(
  collection: PocketBaseCollection,
  customSchemas: Record<string, z.ZodType> | undefined,
  hasSuperuserRights: boolean
): Record<string, z.ZodType> {
  // Prepare the schemas fields
  const fields: Record<string, z.ZodType> = {};

  // Parse every field in the schema
  for (const field of collection.fields) {
    // Skip hidden fields if the user does not have superuser rights
    if (field.hidden && !hasSuperuserRights) {
      continue;
    }

    let fieldType;

    // Determine the field type and create the corresponding Zod type
    switch (field.type) {
      case "number":
        // Coerce the value to a number
        fieldType = z.coerce.number();
        break;
      case "bool":
        // Coerce the value to a boolean
        fieldType = z.coerce.boolean();
        break;
      case "date":
      case "autodate":
        // Coerce and parse the value as a date
        fieldType = z.coerce.date();
        break;
      case "select":
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

    // Check if the field is required (onCreate autodate fields are always set)
    const isRequired =
      field.required || (field.type === "autodate" && field.onCreate);

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
) {
  // If the select allows multiple values, create an array of the enum
  if (field.maxSelect === undefined || field.maxSelect === 1) {
    return type;
  } else {
    return z.array(type);
  }
}
