import { assert } from "vitest";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";
import type { PocketBaseLoaderOptions } from "../../src/types/pocketbase-loader-options.type";
import { sendBatchRequest } from "./batch-requests";

export async function insertEntries(
  data: Array<Record<string, unknown>>,
  options: PocketBaseLoaderOptions,
  superuserToken: string
): Promise<Array<PocketBaseEntry>> {
  const requests = data.map((entry) => ({
    method: "POST" as const,
    url: `/api/collections/${options.collectionName}/records`,
    body: entry
  }));

  const batchResponse = await sendBatchRequest(
    requests,
    options,
    superuserToken
  );

  assert(
    batchResponse.length === data.length,
    "Failed to insert all entries in batch request."
  );

  const dbEntries: Array<PocketBaseEntry> = [];
  for (const entry of batchResponse) {
    dbEntries.push(entry.body.id);
  }
  return dbEntries;
}

export async function insertEntry(
  data: Record<string, unknown>,
  options: PocketBaseLoaderOptions,
  superuserToken: string
): Promise<PocketBaseEntry> {
  const insertRequest = await fetch(
    new URL(`api/collections/${options.collectionName}/records`, options.url),
    {
      method: "POST",
      headers: {
        Authorization: superuserToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );

  const entry = await insertRequest.json();
  assert(entry.id, "Entry ID is not available.");

  return entry;
}
