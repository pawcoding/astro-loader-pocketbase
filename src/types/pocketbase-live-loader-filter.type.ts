/**
 * Filter for a single entry
 */
export interface PocketBaseLiveLoaderEntryFilter {
  /**
   * Id of the entry.
   */
  id: string;
}

/**
 * Filter for a collection of entries.
 */
export interface PocketBaseLiveLoaderCollectionFilter {
  /**
   * Additional filter to apply to the collection.
   * This will be added to the filter supplied in the {@link ExperimentalPocketBaseLiveLoaderOptions}.
   *
   * Valid syntax can be found in the [PocketBase documentation](https://pocketbase.io/docs/api-records/#listsearch-records)
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
   * Valid syntax can be found in the [PocketBase documentation](https://pocketbase.io/docs/api-records/#listsearch-records)
   *
   * Example:
   * ```ts
   * // config:
   * sort: '-created,id'
   *
   * // request
   * `?sort=-created,id`
   * ```
   */
  sort?: string;
}
