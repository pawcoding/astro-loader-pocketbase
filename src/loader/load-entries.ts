import type { LoaderContext } from "astro/loaders";
import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";
import { fetchCollection } from "./fetch-collection";
import { parseEntry } from "./parse-entry";

/**
 * Load (modified) entries from a PocketBase collection.
 *
 * @param options Options for the loader.
 * @param context Context of the loader.
 * @param superuserToken Superuser token to access all resources.
 * @param lastModified Date of the last fetch to only update changed entries.
 */
export async function loadEntries(
  options: PocketBaseLoaderOptions,
  context: LoaderContext,
  superuserToken: string | undefined,
  lastModified: string | undefined
): Promise<void> {
  // Log the fetching of the entries
  context.logger.info(
    `Fetching${lastModified ? " modified" : ""} data${
      lastModified ? ` starting at ${lastModified}` : ""
    }${superuserToken ? " as superuser" : ""}`
  );

  let numEntries = 0;
  await fetchCollection(
    options,
    async (entries) => {
      // Parse and store the entries
      for (const entry of entries) {
        await parseEntry(entry, context, options);
      }

      numEntries += entries.length;
    },
    superuserToken,
    {
      lastModified
    }
  );

  // Log the number of fetched entries
  if (lastModified) {
    context.logger.info(
      `Updated ${numEntries}/${context.store.keys().length} entries.`
    );
  } else {
    context.logger.info(`Fetched ${numEntries} entries.`);
  }
}
