import { z } from "astro/zod";

export function parseSchema(
  schema: Array<Record<string, any>>
): Record<string, z.ZodType> {
  // Prepare the schemas fields
  const fields: Record<string, z.ZodType> = {};

  // Parse every field in the schema
  for (const field of schema) {
    let fieldType;

    // Determine the field type and create the corresponding Zod type
    switch (field.type) {
      case "number":
        // Coerce the value to a number
        fieldType = z.number({ coerce: true });
        break;
      case "bool":
        // Coerce the value to a boolean
        fieldType = z.boolean({ coerce: true });
        break;
      case "date":
        // Coerce and parse the value as a date
        fieldType = z.date({ coerce: true });
        break;
      case "select":
        // Create an enum for the select values
        const values = z.enum(field.options.values);

        // Parse the field type based on the number of values it can have
        fieldType = parseSingleOrMultipleValues(field as any, values);
        break;
      case "relation":
      case "file":
        // NOTE: Relations and files are currently not supported and are treated as strings

        // Parse the field type based on the number of values it can have
        fieldType = parseSingleOrMultipleValues(field as any, z.string());
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
      fieldType.isOptional();
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
  field: { options: { maxSelect: number } },
  type: z.ZodType
) {
  // If the select allows multiple values, create an array of the enum
  if (field.options.maxSelect === 1) {
    return type;
  } else {
    return z.array(type);
  }
}
