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
   * Field that should be used as the unique identifier for the collection.
   * This must be the name of a field in the collection that contains unique values.
   * If not provided, the `id` field will be used.
   * The value of this field will be used in `getEntry` and `getEntries` to load the entry or entries.
   *
   * If the field is a string, it will be slugified to be used in the URL.
   */
  id?: string;
  /**
   * Field should be an array of collections to be watched for realtime events.
   *
   * if the field is not provided, the collectionName will be used.
   */
  watchCollections?: Array<string>;
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
