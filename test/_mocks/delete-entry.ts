import { assert } from "vitest";
import type { PocketBaseLoaderBaseOptions } from "../../src/types/pocketbase-loader-options.type";
import { sendBatchRequest } from "./batch-requests";

export async function deleteEntries(
  entryIds: Array<string>,
  options: PocketBaseLoaderBaseOptions,
  superuserToken: string
): Promise<void> {
  const requests = entryIds.map((entryId) => ({
    method: "DELETE" as const,
    url: `/api/collections/${options.collectionName}/records/${entryId}`
  }));

  const batchResponse = await sendBatchRequest(
    requests,
    options,
    superuserToken
  );

  assert(
    batchResponse.length === entryIds.length,
    "Failed to delete all entries in batch request."
  );
}

export async function deleteEntry(
  entryId: string,
  options: PocketBaseLoaderBaseOptions,
  superuserToken: string
): Promise<void> {
  const deleteRequest = await fetch(
    new URL(
      `api/collections/${options.collectionName}/records/${entryId}`,
      options.url
    ),
    {
      method: "DELETE",
      headers: {
        Authorization: superuserToken
      }
    }
  );

  assert(deleteRequest.status === 204, "Deleting entry failed.");
}
