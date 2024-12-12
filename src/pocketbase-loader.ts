import type { Loader, LoaderContext } from "astro/loaders";
import packageJson from "./../package.json";
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
      // Check if the version has changed to force an update
      const lastVersion = context.meta.get("version");
      if (lastVersion !== packageJson.version) {
        context.logger.info(
          `PocketBase loader was updated from ${lastVersion} to ${packageJson.version}. All entries will be loaded again.`
        );

        options.forceUpdate = true;
      }

      // Get the date of the last fetch to only update changed entries.
      // If `forceUpdate` is set to `true`, this will be `undefined` to fetch all entries again.
      const lastModified = options.forceUpdate
        ? undefined
        : context.meta.get("last-modified");

      // Get the `has-updated-column` meta to check if the collection has an updated column
      let hasUpdatedColumn = context.meta.get("has-updated-column") === "true";

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
      try {
        hasUpdatedColumn = await loadEntries(
          options,
          context,
          token,
          // Only fetch entries that have been modified since the last fetch
          // If the collection does not have an updated column, all entries will be fetched
          hasUpdatedColumn ? lastModified : undefined
        );
      } catch (error) {
        // Set the `has-updated-column` meta to `false` if an error occurred
        // This will force the loader to fetch all entries again in the next run
        context.meta.set("has-updated-column", `${false}`);

        throw error;
      }

      // Set the `has-updated-column` meta to `true` if the collection has an updated column
      context.meta.set("has-updated-column", `${hasUpdatedColumn}`);
      // Set the last modified date to the current date
      context.meta.set("last-modified", new Date().toISOString().replace('T', ' '));
      context.meta.set("realtime-last-modified", new Date().toISOString().replace('T', ' '));


      context.meta.set("version", packageJson.version);
    },
    schema: async () => {
      // Generate the schema for the collection according to the API
      return await generateSchema(options);
    }
  };
}
