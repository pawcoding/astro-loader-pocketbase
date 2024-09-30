/**
 * Entry for a collections schema in PocketBase.
 */
export interface PocketBaseSchemaEntry {
  /**
   * Name of the field.
   */
  name: string;
  /**
   * Type of the field.
   */
  type: string;
  /**
   * Whether the field is required.
   */
  required: boolean;
  /**
   * Options for the field.
   */
  options: {
    /**
     * Values for a select field.
     * This is only present if the field type is "select".
     */
    values?: Array<string>;
    /**
     * Maximum number of values for a select field.
     * This is only present on "select", "relation", and "file" fields.
     */
    maxSelect?: number;
  };
}

/**
 * Schema for a PocketBase collection.
 */
export interface PocketBaseCollection {
  /**
   * Name of the collection.
   */
  name: string;
  /**
   * Type of the collection.
   */
  type: 'base' | 'view' | 'auth';
  /**
   * Schema of the collection.
   */
  schema: Array<PocketBaseSchemaEntry>;
}
