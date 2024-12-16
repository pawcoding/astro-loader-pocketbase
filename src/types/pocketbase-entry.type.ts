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
