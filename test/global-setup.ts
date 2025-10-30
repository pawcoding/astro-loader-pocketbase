import { assert } from "vitest";
import type { TestProject } from "vitest/node";
import { getSuperuserToken } from "../src/utils/get-superuser-token";
import { enableBatchApi } from "./_mocks/batch-requests";
import { checkE2eConnection } from "./_mocks/check-e2e-connection";
import { createLoaderOptions } from "./_mocks/create-loader-options";

/**
 * Setup function for e2e tests.
 *
 * When e2e tests are being run, this function verifies that the PocketBase instance is running,
 * and retrieves a superuser token that is then provided to the tests.
 */
export async function setup(project: TestProject): Promise<void> {
  // Only needed for e2e tests
  const files = (project.vitest as { filenamePattern?: Array<string> })
    .filenamePattern;
  if (files && !files.some((file) => file.includes("e2e-spec"))) {
    return;
  }

  // Verify that PocketBase instance is running
  await checkE2eConnection();

  // Create options
  const options = createLoaderOptions();
  assert(options.superuserCredentials, "Superuser credentials are not set.");
  assert(
    !("impersonateToken" in options.superuserCredentials),
    "Impersonate token should not be used in tests."
  );

  // Get superuser token
  const token = await getSuperuserToken(
    options.url,
    options.superuserCredentials
  );
  assert(token, "Superuser token is not available.");

  // Provide superuser token to tests
  project.provide("superuserToken", token);

  // Enable batch API for e2e tests
  await enableBatchApi(options, token);
}

declare module "vitest" {
  export interface ProvidedContext {
    /**
     * Superuser token for PocketBase instance.
     */
    superuserToken: string;
  }
}
