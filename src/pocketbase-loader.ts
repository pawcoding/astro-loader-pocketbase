import type { Loader, LoaderContext } from "astro/loaders";
import packageJson from "./../package.json";
import { cleanupEntries } from "./cleanup-entries";
import { generateSchema } from "./generate-schema";
import { loadEntries } from "./load-entries";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";
import { getSuperuserToken } from "./utils/get-superuser-token";

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
      let lastModified = context.meta.get("last-modified");

      // Check if the version has changed to force an update
      const lastVersion = context.meta.get("version");
      if (lastVersion !== packageJson.version) {
        if (lastVersion) {
          context.logger.info(
            `PocketBase loader was updated from ${lastVersion} to ${packageJson.version}. All entries will be loaded again.`
          );
        }

        // Disable incremental builds and clear the store
        lastModified = undefined;
        context.store.clear();
      }

      // Disable incremental builds if no updated field is provided
      if (!options.updatedField) {
        context.logger.info(
          `(${options.collectionName}) No "updatedField" was provided. Incremental builds are disabled.`
        );
        lastModified = undefined;
      }

      // Try to get a superuser token to access all resources.
      let token: string | undefined;
      if (options.superuserCredentials) {
        token = await getSuperuserToken(
          options.url,
          options.superuserCredentials,
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

      context.meta.set("version", packageJson.version);
    },
    schema: async () => {
      // Generate the schema for the collection according to the API
      return await generateSchema(options);
    }
  };
}
