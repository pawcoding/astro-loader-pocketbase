import { z } from "astro/zod";
import type {
  PocketBaseCollection,
  PocketBaseSchemaEntry
} from "../types/pocketbase-schema.type";

export interface ParseSchemaOptions {
  hasSuperuserRights: boolean;
  improveTypes?: boolean;
  fieldsToInclude?: Array<string>;
  experimentalLiveTypesOnly?: boolean;
}

/**
 * Converts PocketBase collection fields into Zod types, handling field types, required status, and custom schemas.
 */
export function parseSchema(
  collection: PocketBaseCollection,
  customSchemas: Record<string, z.ZodType> | undefined,
  options: ParseSchemaOptions
): Record<string, z.ZodType> {
  // Prepare the schemas fields
  const fields: Record<string, z.ZodType> = {};

  // Parse every field in the schema
  for (const field of collection.fields) {
    // If fieldsToInclude is specified, only include fields that are in the list
    if (
      options.fieldsToInclude &&
      !options.fieldsToInclude.includes(field.name)
    ) {
      continue;
    }

    // Skip hidden fields if the user does not have superuser rights
    if (field.hidden && !options.hasSuperuserRights) {
      if (options.fieldsToInclude) {
        console.warn(
          `"${field.name}" is requested but hidden. Provide superuser credentials to include this field.`
        );
      }

      continue;
    }

    let fieldType;

    // Determine the field type and create the corresponding Zod type
    // oxlint-disable-next-line switch-exhaustiveness-check
    switch (field.type) {
      case "number":
        fieldType = z.number();
        break;
      case "bool":
        fieldType = z.boolean();
        break;
      case "date":
      case "autodate":
        if (options.experimentalLiveTypesOnly) {
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
        // oxlint-disable-next-line no-unsafe-type-assertion
        const values = z.enum(field.values as [string, ...Array<string>]);

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
      (options.improveTypes &&
        (field.type === "number" || field.type === "bool"));

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
