import type { AstroIntegrationLogger } from "astro";

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
    if (loginRequest.status === 429) {
      const info =
        "A rate limit was hit while trying to authenticate with PocketBase. Consider using an `impersonateToken` as credentials to avoid this issue.";
      if (logger) {
        logger.info(info);
      } else {
        console.info(info);
      }

      // Random wait between 3 (default rate limit interval) and 8 seconds
      const retryAfter = Math.random() * 5 + 3;
      // oxlint-disable-next-line promise/avoid-new
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));

      return getSuperuserToken(url, superuserCredentials, logger);
    }

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
