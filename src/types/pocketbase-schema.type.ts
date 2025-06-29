/**
 * Entry for a collections schema in PocketBase.
 */
export interface PocketBaseSchemaEntry {
  /**
   * Flag to indicate if the field is hidden.
   * Hidden fields are not returned in the API response.
   */
  hidden: boolean;
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
   * Values for a select field.
   * This is only present if the field type is "select".
   */
  values?: Array<string>;
  /**
   * Maximum number of values for a select field.
   * This is only present on "select", "relation", and "file" fields.
   */
  maxSelect?: number;
  /**
   * Whether the field is filled when the entry is created.
   * This is only present on "autodate" fields.
   */
  onCreate?: boolean;
  /**
   * Whether the field is updated when the entry is updated.
   * This is only present on "autodate" fields.
   */
  onUpdate?: boolean;

  /**
   * The associated collection id that the relation field is referencing
   * This is only present on "relation" fields.
   */
  collectionId?: string;
}
