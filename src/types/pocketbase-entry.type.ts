import { z } from "astro/zod";

/**
 * Schema for a PocketBase entry.
 */
export const pocketBaseEntry = z.looseObject({
  /**
   * ID of the entry.
   */
  id: z.string(),
  /**
   * ID of the collection the entry belongs to.
   */
  collectionId: z.string(),
  /**
   * Name of the collection the entry belongs to.
   */
  collectionName: z.string()
});

/**
 * Type for a PocketBase entry.
 */
export type PocketBaseEntry = z.infer<typeof pocketBaseEntry>;
