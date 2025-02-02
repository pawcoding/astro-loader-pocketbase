import type { Loader } from "astro/loaders";
import { loader } from "./loader/loader";
import { generateSchema } from "./schema/generate-schema";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";

/**
 * Loader for collections stored in PocketBase.
 *
 * @param options Options for the loader. See {@link PocketBaseLoaderOptions} for more details.
 */
export function pocketbaseLoader(options: PocketBaseLoaderOptions): Loader {
  return {
    name: "pocketbase-loader",
    // Load the entries from the collection
    load: async (context) => loader(context, options),
    // Generate the schema for the collection according to the API
    schema: async () => await generateSchema(options)
  };
}
