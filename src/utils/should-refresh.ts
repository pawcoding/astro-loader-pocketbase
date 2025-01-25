import type { LoaderContext } from "astro/loaders";

/**
 * Checks if the collection should be refreshed.
 */
export function shouldRefresh(
  context: LoaderContext["refreshContextData"],
  collectionName: string
): boolean {
  // Check if the refresh was triggered by the `astro-integration-pocketbase`
  // and the correct metadata is provided.
  if (
    !context ||
    context.source !== "astro-integration-pocketbase" ||
    !context.collection
  ) {
    return true;
  }

  // Check if the collection name matches the current collection.
  if (typeof context.collection === "string") {
    return context.collection === collectionName;
  }

  // Check if the collection is included in the list of collections.
  if (Array.isArray(context.collection)) {
    return context.collection.includes(collectionName);
  }

  // Should not happen but return true to be safe.
  return true;
}
