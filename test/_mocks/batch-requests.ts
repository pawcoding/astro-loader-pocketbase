import { assert } from "vitest";
import type { PocketBaseLoaderBaseOptions } from "../../src/types/pocketbase-loader-options.type";

export async function sendBatchRequest(
  requests: Array<{
    method: "POST" | "DELETE";
    url: string;
    body?: Record<string, unknown>;
  }>,
  options: PocketBaseLoaderBaseOptions,
  superuserToken: string
  // oxlint-disable-next-line no-explicit-any
): Promise<any> {
  await enableBatchApi(options, superuserToken);

  const batchRequest = await fetch(new URL(`api/batch`, options.url), {
    method: "POST",
    headers: {
      Authorization: superuserToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ requests })
  });

  assert(batchRequest.status === 200, "Failed to send batch request.");

  return await batchRequest.json();
}

async function enableBatchApi(
  options: PocketBaseLoaderBaseOptions,
  superuserToken: string
): Promise<void> {
  const updateSettingsRequest = await fetch(
    new URL(`api/settings`, options.url),
    {
      method: "PATCH",
      headers: {
        Authorization: superuserToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        batch: {
          enabled: true,
          maxBodySize: 0,
          maxRequests: 300,
          timeout: 3
        }
      })
    }
  );

  assert(
    updateSettingsRequest.status === 200,
    "Failed to update settings for batch processing."
  );
}
