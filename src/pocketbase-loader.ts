import type { LiveDataCollection, LiveDataEntry } from "astro";
import type { LiveCollectionError } from "astro/content/runtime";
import type { LiveLoader, Loader } from "astro/loaders";
import type { ZodSchema } from "astro/zod";
import { liveCollectionLoader } from "./loader/live-collection-loader";
import { liveEntryLoader } from "./loader/live-entry-loader";
import { loader } from "./loader/loader";
import { generateSchema } from "./schema/generate-schema";
import type { PocketBaseEntry } from "./types/pocketbase-entry.type";
import type {
  ExperimentalPocketBaseLiveLoaderCollectionFilter,
  ExperimentalPocketBaseLiveLoaderEntryFilter
} from "./types/pocketbase-live-loader-filter.type";
import type {
  ExperimentalPocketBaseLiveLoaderOptions,
  PocketBaseLoaderOptions
} from "./types/pocketbase-loader-options.type";
import { createTokenPromise } from "./utils/create-token-promise";

/**
 * Loader for collections stored in PocketBase.
 *
 * @param options Options for the loader. See {@link PocketBaseLoaderOptions} for more details.
 */
export function pocketbaseLoader(options: PocketBaseLoaderOptions): Loader {
  // Create shared promise for the superuser token, which can be reused
  const tokenPromise = createTokenPromise(options);

  return {
    name: "pocketbase-loader",
    load: async (context): Promise<void> => {
      if (options.experimental?.liveTypesOnly) {
        context.logger.label = `pocketbase-loader:${options.collectionName}`;
        context.logger.info(
          "Experimental live types only mode enabled. No data will be loaded, only types will be generated."
        );
        return;
      }

      const token = await tokenPromise;

      // Load the entries from the collection
      await loader(context, options, token);
    },
    schema: async (): Promise<ZodSchema> => {
      const token = await tokenPromise;

      // Generate the schema for the collection according to the API
      return generateSchema(options, token);
    }
  };
}

/**
 * Live loader for collections stored in PocketBase.
 * This loader is currently experimental and may change in any future release.
 *
 * @param options Options for the live loader. See {@link ExperimentalPocketBaseLiveLoaderOptions} for more details.
 *
 * @experimental Live content collections are still experimental
 */
export function experimentalPocketbaseLiveLoader<
  TEntry extends PocketBaseEntry
>(
  options: ExperimentalPocketBaseLiveLoaderOptions
): LiveLoader<
  TEntry,
  ExperimentalPocketBaseLiveLoaderEntryFilter,
  ExperimentalPocketBaseLiveLoaderCollectionFilter,
  LiveCollectionError
> {
  // Create shared promise for the superuser token, which can be reused
  const tokenPromise = createTokenPromise(options);

  return {
    name: "pocketbase-live-loader",
    loadCollection: async ({
      filter
    }): Promise<
      LiveDataCollection<TEntry> | { error: LiveCollectionError }
    > => {
      const token = await tokenPromise;

      // Load entries from the collection
      return liveCollectionLoader<TEntry>(filter, options, token);
    },
    loadEntry: async ({
      filter
    }): Promise<LiveDataEntry<TEntry> | { error: LiveCollectionError }> => {
      const token = await tokenPromise;

      // Load a single entry from the collection
      return liveEntryLoader<TEntry>(filter.id, options, token);
    }
  };
}
