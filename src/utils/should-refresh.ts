import type { LoaderContext } from "astro/loaders";
import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";

/**
 * Checks if the collection should be refreshed.
 */
export function shouldRefresh(
  context: LoaderContext["refreshContextData"],
  options: Pick<PocketBaseLoaderOptions, "collectionName" | "experimental">
): "refresh" | "skip" | "force" {
  // Check if the refresh was triggered by the `astro-integration-pocketbase`
  // and the correct metadata is provided.
  if (!context || context.source !== "astro-integration-pocketbase") {
    return "refresh";
  }

  // Check if all collections should be refreshed.
  if (context.force) {
    return "force";
  }

  // If no collection is was provided refresh just in case
  if (!context.collection) {
    return "refresh";
  }

  // Must refresh all collections when expand is set
  if (options.experimental?.expand) {
    return "refresh";
  }

  // Check if the collection name matches the current collection.
  if (typeof context.collection === "string") {
    return context.collection === options.collectionName ? "refresh" : "skip";
  }

  // Check if the collection is included in the list of collections.
  if (Array.isArray(context.collection)) {
    return context.collection.includes(options.collectionName)
      ? "refresh"
      : "skip";
  }

  // Should not happen but return true to be safe.
  return "refresh";
}
