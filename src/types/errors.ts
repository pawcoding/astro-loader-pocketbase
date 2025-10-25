import { LiveCollectionError } from "astro/content/runtime";

/**
 * Error thrown when there is an authentication issue with PocketBase.
 */
export class PocketBaseAuthenticationError extends LiveCollectionError {
  constructor(collection: string, message: string) {
    super(collection, message);
    this.name = "PocketBaseAuthenticationError";
  }

  static is(error: unknown): error is PocketBaseAuthenticationError {
    // This is similar to the original implementation in Astro itself.
    return (
      // oxlint-disable-next-line no-unsafe-type-assertion
      !!error && (error as Error)?.name === "PocketBaseAuthenticationError"
    );
  }
}
