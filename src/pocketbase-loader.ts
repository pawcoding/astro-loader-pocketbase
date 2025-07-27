import type { Loader } from "astro/loaders";
import type { ZodSchema } from "astro/zod";
import { loader } from "./loader/loader";
import { generateSchema } from "./schema/generate-schema";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";
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
