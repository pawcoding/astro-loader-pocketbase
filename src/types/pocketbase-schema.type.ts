import { z } from "astro/zod";

/**
 * Entry for a collections schema in PocketBase.
 */
export const pocketBaseSchemaEntry = z.object({
  /**
   * Flag to indicate if the field is hidden.
   * Hidden fields are not returned in the API response.
   */
  hidden: z.optional(z.boolean()),
  /**
   * Name of the field.
   */
  name: z.string(),
  /**
   * Type of the field.
   */
  type: z.enum([
    "text",
    "editor",
    "number",
    "bool",
    "email",
    "url",
    "date",
    "autodate",
    "select",
    "file",
    "relation",
    "json",
    "geoPoint",
    "password"
  ]),
  /**
   * Whether the field is required.
   */
  required: z.optional(z.boolean()),
  /**
   * Values for a select field.
   * This is only present if the field type is "select".
   */
  values: z.optional(z.array(z.string())),
  /**
   * Maximum number of values for a select field.
   * This is only present on "select", "relation", and "file" fields.
   */
  maxSelect: z.optional(z.number()),
  /**
   * Whether the field is filled when the entry is created.
   * This is only present on "autodate" fields.
   */
  onCreate: z.optional(z.boolean()),
  /**
   * Whether the field is updated when the entry is updated.
   * This is only present on "autodate" fields.
   */
  onUpdate: z.optional(z.boolean())
});

/**
 * Entry for a collections schema in PocketBase.
 */
export type PocketBaseSchemaEntry = z.infer<typeof pocketBaseSchemaEntry>;

/**
 * Schema for a PocketBase collection.
 */
export const pocketBaseCollection = z.object({
  /**
   * Name of the collection.
   */
  name: z.string(),
  /**
   * Type of the collection.
   */
  type: z.enum(["base", "view", "auth"]),
  /**
   * Schema of the collection.
   */
  fields: z.array(pocketBaseSchemaEntry)
});

/**
 * Type for a PocketBase collection.
 */
export type PocketBaseCollection = z.infer<typeof pocketBaseCollection>;

/**
 * Schema for an entire PocketBase database.
 */
export const pocketBaseDatabase = z.array(pocketBaseCollection);
