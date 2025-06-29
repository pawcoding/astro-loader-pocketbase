import type { ZodSchema } from "astro/zod";
import type { PocketBaseSchemaEntry } from "./pocketbase-schema.type";

/**
 * Base interface for all PocketBase entries.
 */
interface PocketBaseBaseCollection {
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

/**
 * Type for a PocketBase entry.
 */
export type PocketBaseCollection = PocketBaseBaseCollection &
  Record<string, unknown>;

export type ExpandedFields = Record<string, ZodSchema | Array<ZodSchema>>;
