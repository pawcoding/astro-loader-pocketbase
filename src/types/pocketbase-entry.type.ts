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
   * Optional property that contains all relational fields that have been expanded to contain their linked entry(s)
   */
  expand?: Record<string, PocketBaseEntry | Array<PocketBaseEntry | null>>;
}

/**
 * Type for a PocketBase entry.
 */
export type PocketBaseEntry = PocketBaseBaseEntry & Record<string, unknown>;
