import type { AstroIntegrationLogger } from "astro";
import {
  pocketbaseAuthResponseSchema,
  pocketbaseErrorResponseSchema
} from "../types/pocketbase-api-responses.type";

/**
 * This function will get a superuser token from the given PocketBase instance.
 *
 * @param url URL of the PocketBase instance
 * @param superuserCredentials Credentials of the superuser
 *
 * @returns A superuser token to access all resources of the PocketBase instance.
 */
export async function getSuperuserToken(
  url: string,
  superuserCredentials: {
    email: string;
    password: string;
  },
  logger?: AstroIntegrationLogger
): Promise<string | undefined> {
  // Build the URL for the login endpoint
  const loginUrl = new URL(
    `api/collections/_superusers/auth-with-password`,
    url
  ).href;

  // Create a new FormData object to send the login data
  const loginData = new FormData();
  loginData.set("identity", superuserCredentials.email);
  loginData.set("password", superuserCredentials.password);

  // Send the login request to get a token
  const loginRequest = await fetch(loginUrl, {
    method: "POST",
    body: loginData
  });

  // If the login request was not successful, print the error message and return undefined
  if (!loginRequest.ok) {
    let errorMessage = `The given email / password for ${url} was not correct. Astro can't generate type definitions automatically and may not have access to all resources.`;
    try {
      const errorData = (await loginRequest.json()) as unknown;
      const parsedError = pocketbaseErrorResponseSchema.parse(errorData);
      errorMessage += `\nReason: ${parsedError.message}`;
    } catch {
      // If parsing fails, just use the basic error message
    }
    if (logger) {
      logger.error(errorMessage);
    } else {
      console.error(errorMessage);
    }
    return undefined;
  }

  // Return the token
  const authData = (await loginRequest.json()) as unknown;
  const parsedAuth = pocketbaseAuthResponseSchema.parse(authData);
  return parsedAuth.token;
}
