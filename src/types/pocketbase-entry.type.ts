import { z } from "astro/zod";

/**
 * Base interface for all PocketBase entries.
 */
interface PocketBaseBaseEntry {
  /**
   * ID of the entry.
   */
  id: string;
  /**
   * ID of the collection the entry belongs to.
   */
  collectionId: string;
  /**
   * Name of the collection the entry belongs to.
   */
  collectionName: string;
}

/**
 * Type for a PocketBase entry.
 */
export type PocketBaseEntry = PocketBaseBaseEntry & Record<string, unknown>;

/**
 * Base Zod schema for PocketBase entries.
 * This schema validates the core fields that all PocketBase entries have.
 */
export const pocketBaseEntrySchema = z
  .object({
    id: z.string(),
    collectionId: z.string(),
    collectionName: z.string()
  })
  .passthrough(); // Allow additional fields
