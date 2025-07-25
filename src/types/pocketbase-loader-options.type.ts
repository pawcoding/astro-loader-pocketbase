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
  idField?: string;
  /**
   * Name of the field(s) containing the content of an entry.
   * This must be the name of a field in the PocketBase collection that contains the content.
   * The content will be parsed as HTML and rendered to the page.
   *
   * If you want to render multiple fields as main content, you can pass an array of field names.
   * The loader will concatenate the content of all fields in the order they are defined in the array.
   * Each block will be contained in a `<section>` element.
   */
  contentFields?: string | Array<string>;
  /**
   * Name of the field containing the last update date of an entry.
   * Ideally, this field should be of type `autodate` and have the value "Update" or "Create/Update".
   * This field is used to only fetch entries that have been modified since the last build.
   */
  updatedField?: string;
  /**
   * Custom filter that is applied when loading data from PocketBase.
   * Valid syntax can be found in the [PocketBase documentation](https://pocketbase.io/docs/api-records/#listsearch-records)
   *
   * The loader will also add it's own filters for incremental builds.
   * These will be added to your custom filter query.
   *
   * Example:
   * ```ts
   * // config:
   * filter: 'release >= @now && deleted = false'
   *
   * // request
   * `?filter=(${loaderFilter})&&(release >= @now && deleted = false)`
   * ```
   */
  filter?: string;
  /**
   * Credentials of a superuser to get full access to the PocketBase instance.
   * This is required to get automatic type generation without a local schema, to access all resources even if they are not public and to fetch content of hidden fields.
   */
  superuserCredentials?:
    | {
        /**
         * Email of the superuser.
         */
        email: string;
        /**
         * Password of the superuser.
         */
        password: string;
      }
    | {
        /**
         * Impersonate auth token of the superuser.
         * This token will take precedence over the email and password.
         */
        impersonateToken: string;
      };
  /**
   * File path to the local schema file.
   * This file will be used to generate the schema for the collection.
   * If `superuserCredentials` are provided, this option will be ignored.
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
   * Whether to improve the types of the generated schema.
   * With this option enabled, the schema will not include `undefined` as possible value for number and boolean fields and mark them as required.
   *
   * Why do we need this option?
   * The PocketBase API does always return at least `0` or `false` as the default values, even though the fields are not marked as required in the schema.
   */
  improveTypes?: boolean;
}
