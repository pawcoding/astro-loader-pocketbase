import type { LoaderContext } from "astro/loaders";

/**
 * Checks if the collection should be refreshed.
 */
export function shouldRefresh(
  context: LoaderContext["refreshContextData"],
  collectionName: string
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

  if (!context.collection) {
    return "refresh";
  }

  // Check if the collection name matches the current collection.
  if (typeof context.collection === "string") {
    return context.collection === collectionName ? "refresh" : "skip";
  }

  // Check if the collection is included in the list of collections.
  if (Array.isArray(context.collection)) {
    return context.collection.includes(collectionName) ? "refresh" : "skip";
  }

  // Should not happen but return true to be safe.
  return "refresh";
}
