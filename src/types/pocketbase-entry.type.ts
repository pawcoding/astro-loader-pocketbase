import { z } from "astro/zod";

/**
 * Base schema for all PocketBase entries.
 */
export const pocketBaseBaseEntry = z.object({
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
 * Base interface for all PocketBase entries.
 */
export type PocketBaseBaseEntry = z.infer<typeof pocketBaseBaseEntry>;

/**
 * Schema for a PocketBase entry.
 */
export const pocketBaseEntry = pocketBaseBaseEntry.passthrough();

/**
 * Type for a PocketBase entry.
 */
export type PocketBaseEntry = z.infer<typeof pocketBaseEntry>;
