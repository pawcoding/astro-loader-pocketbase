import type { AstroIntegrationLogger } from "astro";

/**
 * This function will get an admin token from the given PocketBase instance.
 *
 * @param url URL of the PocketBase instance
 * @param email Email of the admin
 * @param password Password of the admin
 *
 * @returns An admin token to access all resources of the PocketBase instance.
 */
export async function getAdminToken(
  url: string,
  email: string,
  password: string,
  logger?: AstroIntegrationLogger
): Promise<string | undefined> {
  // Build the URL for the login endpoint
  const loginUrl = new URL(`api/admins/auth-with-password`, url).href;

  // Create a new FormData object to send the login data
  const loginData = new FormData();
  loginData.set("identity", email);
  loginData.set("password", password);

  // Send the login request to get a token
  const loginRequest = await fetch(loginUrl, {
    method: "POST",
    body: loginData
  });

  // If the login request was not successful, print the error message and return undefined
  if (!loginRequest.ok) {
    const reason = await loginRequest.json().then((data) => data.message);
    const errorMessage = `The given email / password for ${url} was not correct. Astro can't generate type definitions automatically and may not have access to all resources.\nReason: ${reason}`;
    if (logger) {
      logger.error(errorMessage);
    } else {
      console.error(errorMessage);
    }
    return undefined;
  }

  // Return the token
  return await loginRequest.json().then((data) => data.token);
}
