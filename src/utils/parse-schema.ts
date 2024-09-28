import { z } from "astro/zod";
import type {
  PocketBaseCollection,
  PocketBaseSchemaEntry
} from "../types/pocketbase-schema.type";

export function parseSchema(
  collection: PocketBaseCollection
): Record<string, z.ZodType> {
  // Prepare the schemas fields
  const fields: Record<string, z.ZodType> = {};

  // Parse every field in the schema
  for (const field of collection.schema) {
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
        // Coerce and parse the value as a date
        fieldType = z.coerce.date();
        break;
      case "select":
        if (!field.options.values) {
          throw new Error(
            `Field ${field.name} is of type "select" but has no values defined.`
          );
        }

        // Create an enum for the select values
        // @ts-expect-error - Zod complains because the values are not known at compile time and thus the array is not static.
        const values = z.enum(field.options.values);

        // Parse the field type based on the number of values it can have
        fieldType = parseSingleOrMultipleValues(field, values);
        break;
      case "relation":
      case "file":
        // NOTE: Relations and files are currently not supported and are treated as strings

        // Parse the field type based on the number of values it can have
        fieldType = parseSingleOrMultipleValues(field, z.string());
        break;
      case "json":
        // Parse the field as an object
        fieldType = z.object({});
        break;
      default:
        // Default to a string
        fieldType = z.string();
        break;
    }

    // If the field is not required, mark it as optional
    if (!field.required) {
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
  if (field.options.maxSelect === undefined || field.options.maxSelect === 1) {
    return type;
  } else {
    return z.array(type);
  }
}
