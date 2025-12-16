import type { ZodType } from "astro/zod";
import {
  createAuxiliaryTypeStore,
  createTypeAlias,
  printNode,
  zodToTs
} from "zod-to-ts";

/**
 * Generate a TypeScript type from a Zod schema.
 */
export function generateType(schema: ZodType): string {
  const { node } = zodToTs(schema, {
    auxiliaryTypeStore: createAuxiliaryTypeStore()
  });
  const typeAlias = createTypeAlias(node, "Entry");

  return `export ${printNode(typeAlias)}`;
}
