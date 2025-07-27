import type { PocketBaseLoaderOptions } from "../types/pocketbase-loader-options.type";
import { getSuperuserToken } from "./get-superuser-token";

/**
 * Creates a promise that resolves to a superuser token or undefined.
 */
export async function createTokenPromise(
  options: Pick<PocketBaseLoaderOptions, "url" | "superuserCredentials">
): Promise<string | undefined> {
  if (options.superuserCredentials) {
    if ("impersonateToken" in options.superuserCredentials) {
      // Impersonate token provided, so use it directly.
      return options.superuserCredentials.impersonateToken;
    }
    // Email and password provided, so get a temporary superuser token.
    const token = await getSuperuserToken(
      options.url,
      options.superuserCredentials
    );
    return token;
  }

  // No credentials provided, so no token can be used.
  return undefined;
}
