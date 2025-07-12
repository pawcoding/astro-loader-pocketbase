import type { PocketBaseSchemaEntry } from "./pocketbase-schema.type";

/**
 * Base interface for all PocketBase collections.
 */
export interface PocketBaseCollection {
  /**
   * ID of the collection.
   */
  id: string;
  /**
   * Name of the collection
   */
  name: string;
  /**
   * Type of the collection.
   */
  type: "base" | "view" | "auth";
  /**
   * Schema of the collection.
   */
  fields: Array<PocketBaseSchemaEntry>;
}
