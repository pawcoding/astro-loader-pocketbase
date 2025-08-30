/**
 * Filter for a single entry
 *
 * @experimental Live content collections are still experimental
 */
export interface ExperimentalPocketBaseLiveLoaderEntryFilter {
  /**
   * Id of the entry.
   */
  id: string;
}

/**
 * Filter for a collection of entries.
 *
 * @experimental Live content collections are still experimental
 */
export interface ExperimentalPocketBaseLiveLoaderCollectionFilter {
  /**
   * Additional filter to apply to the collection.
   * This will be added to the filter supplied in the {@link ExperimentalPocketBaseLiveLoaderOptions}.
   *
   * Example:
   * ```ts
   * // config:
   * filter: 'release >= @now && deleted = false'
   *
   * // request
   * `?filter=(${loaderFilter})&&(release >= @now && deleted = false)`
   * ```
   *
   * @see {@link https://pocketbase.io/docs/api-records/#listsearch-records PocketBase documentation} for valid syntax
   */
  filter?: string;
  /**
   * Page number to load (1-indexed).
   */
  page?: number;
  /**
   * Number of entries to load per page.
   * If not provided all entries will be loaded in chunks of 100.
   */
  perPage?: number;
  /**
   * Sort order in which the entries should be returned.
   *
   * Example:
   * ```ts
   * // config:
   * sort: '-created,id'
   *
   * // request
   * `?sort=-created,id`
   * ```
   *
   * @see {@link https://pocketbase.io/docs/api-records/#listsearch-records PocketBase documentation} for valid syntax
   */
  sort?: string;
}
