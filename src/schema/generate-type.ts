import type { ZodObject, ZodPipe } from "astro/zod";
import {
  createAuxiliaryTypeStore,
  createTypeAlias,
  printNode,
  zodToTs
} from "zod-to-ts";

/**
 * Generate a TypeScript type from a Zod schema.
 */
export function generateType(schema: ZodObject | ZodPipe): string {
  // If the collection contains file fields, we transform the field values to file urls in a `transform` step.
  // This means that the schema for the types is different from the schema for the data, so we need to extract the inner schema for the types.
  const schemaForTypes = schema.type === "pipe" ? schema.in : schema;

  const { node } = zodToTs(schemaForTypes, {
    auxiliaryTypeStore: createAuxiliaryTypeStore()
  });
  const typeAlias = createTypeAlias(node, "Entry");

  return `export ${printNode(typeAlias)}`;
}
