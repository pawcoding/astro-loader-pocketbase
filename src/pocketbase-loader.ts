import type { LiveDataCollection, LiveDataEntry } from "astro";
import type { LiveLoader, Loader } from "astro/loaders";
import type { ZodSchema } from "astro/zod";
import { liveCollectionLoader } from "./loader/live-collection-loader";
import { liveEntryLoader } from "./loader/live-entry-loader";
import { loader } from "./loader/loader";
import { generateSchema } from "./schema/generate-schema";
import type { PocketBaseEntry } from "./types/pocketbase-entry.type";
import type {
  ExperimentalPocketBaseLiveLoaderOptions,
  PocketBaseLoaderOptions
} from "./types/pocketbase-loader-options.type";
import { getSuperuserToken } from "./utils/get-superuser-token";

/**
 * Loader for collections stored in PocketBase.
 *
 * @param options Options for the loader. See {@link PocketBaseLoaderOptions} for more details.
 */
export function pocketbaseLoader(options: PocketBaseLoaderOptions): Loader {
  let tokenPromise: Promise<string | undefined>;
  if (options.superuserCredentials) {
    if ("impersonateToken" in options.superuserCredentials) {
      // Impersonate token provided, so use it directly.
      tokenPromise = Promise.resolve(
        options.superuserCredentials.impersonateToken
      );
    } else {
      // Email and password provided, so get a temporary superuser token.
      tokenPromise = getSuperuserToken(
        options.url,
        options.superuserCredentials
      );
    }
  } else {
    // No credentials provided, so no token can be used.
    tokenPromise = Promise.resolve(undefined);
  }

  return {
    name: "pocketbase-loader",
    load: async (context): Promise<void> => {
      const token = await tokenPromise;

      // Load the entries from the collection
      await loader(context, options, token);
    },
    schema: async (): Promise<ZodSchema> => {
      const token = await tokenPromise;

      // Generate the schema for the collection according to the API
      return await generateSchema(options, token);
    }
  };
}

/**
 * Live loader for collections stored in PocketBase.
 * This loader is currently experimental and may change in any future release.
 *
 * @param options Options for the live loader. See {@link ExperimentalPocketBaseLiveLoaderOptions} for more details.
 */
export function experimentalPocketbaseLiveLoader<
  TEntry extends PocketBaseEntry
>(
  options: ExperimentalPocketBaseLiveLoaderOptions
): LiveLoader<TEntry, { id: string }> {
  let tokenPromise: Promise<string | undefined>;
  if (options.superuserCredentials) {
    if ("impersonateToken" in options.superuserCredentials) {
      // Impersonate token provided, so use it directly.
      tokenPromise = Promise.resolve(
        options.superuserCredentials.impersonateToken
      );
    } else {
      // Email and password provided, so get a temporary superuser token.
      tokenPromise = getSuperuserToken(
        options.url,
        options.superuserCredentials
      );
    }
  } else {
    // No credentials provided, so no token can be used.
    tokenPromise = Promise.resolve(undefined);
  }

  return {
    name: "pocketbase-live-loader",
    loadCollection: async (): Promise<
      LiveDataCollection<TEntry> | { error: Error }
    > => {
      const token = await tokenPromise;

      // Load entries from the collection
      return await liveCollectionLoader(options, token);
    },
    loadEntry: async ({
      filter
    }): Promise<LiveDataEntry<TEntry> | { error: Error }> => {
      const token = await tokenPromise;

      // Load a single entry from the collection
      return await liveEntryLoader(filter.id, options, token);
    }
  };
}
