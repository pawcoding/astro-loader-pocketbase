import type { z } from "astro/zod";

/**
 * Options for the PocketBase loader.
 */
export interface PocketBaseLoaderOptions {
  /**
   * URL of the PocketBase instance.
   */
  url: string;
  /**
   * Name of the collection in PocketBase.
   */
  collectionName: string;
  /**
   * ID of the collection in PocketBase.
   * This is the name of the field that would be used as the ID for the collection.
   * If not provided, the ID of the entry will be used.
   * This will be used in getEntry and getEntries to fetch the entry or entries by ID.
   */
  id?: string;
  /**
   * Content of the collection in PocketBase.
   * This must be the name of a field in the collection that contains the content.
   * The content will be parsed as HTML and rendered to the page.
   *
   * If you want to render multiple fields as main content, you can pass an array of field names.
   * The loader will concatenate the content of all fields in the order they are defined in the array.
   * Each block will be contained in a `<section>` element.
   */
  content?: string | Array<string>;
  /**
   * Email of an admin to get full access to the PocketBase instance.
   * Together with `adminPassword` this is required to get automatic type generation and to access all resources even if they are not public.
   */
  adminEmail?: string;
  /**
   * Password of the admin to get full access to the PocketBase instance.
   * Together with `adminEmail` this is required to get automatic type generation and to access all resources even if they are not public.
   */
  adminPassword?: string;
  /**
   * File path to the local schema file.
   * This file will be used to generate the schema for the collection.
   * If admin credentials are provided (see `adminEmail` and `adminPassword`), this option will be ignored.
   */
  localSchema?: string;
  /**
   * Record of zod schemas for all JSON fields in the collection.
   * The key must be the name of a field in the collection.
   * If no schema is provided for a field, the value will be treated as `unknown`.
   *
   * Note that this will only be used for fields of type `json`.
   */
  jsonSchemas?: Record<string, z.ZodSchema>;
  /**
   * By default, the loader will only fetch entries that have been modified since the last fetch.
   * If you want to fetch all entries, set this to `true`.
   */
  forceUpdate?: boolean;
}
