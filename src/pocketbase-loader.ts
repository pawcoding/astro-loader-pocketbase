import type { Loader, LoaderContext } from "astro/loaders";
import { cleanupEntries } from "./cleanup-entries";
import { generateSchema } from "./generate-schema";
import { loadEntries } from "./load-entries";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";
import { getAdminToken } from "./utils/get-admin-token";

/**
 * Loader for collections stored in PocketBase.
 *
 * @param options Options for the loader. See {@link PocketBaseLoaderOptions} for more details.
 */
export function pocketbaseLoader(options: PocketBaseLoaderOptions): Loader {
  return {
    name: "pocketbase-loader",
    load: async (context: LoaderContext): Promise<void> => {
      // Get the date of the last fetch to only update changed entries.
      // If `forceUpdate` is set to `true`, this will be `undefined` to fetch all entries again.
      const lastModified = options.forceUpdate
        ? undefined
        : context.meta.get("last-modified");

      // Clear the store if we want to fetch all entries again
      if (options.forceUpdate) {
        context.store.clear();
      }

      // Try to get an admin token to access all resources.
      let token: string | undefined;
      if (options.adminEmail && options.adminPassword) {
        token = await getAdminToken(
          options.url,
          options.adminEmail,
          options.adminPassword,
          context.logger
        );
      }

      if (context.store.keys().length > 0) {
        // Cleanup entries that are no longer in the collection
        await cleanupEntries(options, context, token);
      }

      // Load the (modified) entries
      await loadEntries(options, context, token, lastModified);

      // Set the last modified date to the current date
      context.meta.set("last-modified", new Date().toISOString());
    },
    schema: async () => {
      // Generate the schema for the collection according to the API
      return await generateSchema(options);
    }
  };
}
