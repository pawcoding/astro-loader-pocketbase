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
  /**
   * Date the entry was created.
   */
  created?: string | undefined;
  /**
   * Date the entry was last updated.
   */
  updated?: string | undefined;
}

/**
 * Type for a PocketBase entry.
 */
export type PocketBaseEntry = PocketBaseBaseEntry & Record<string, unknown>;
