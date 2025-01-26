import { assert } from "vitest";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";
import type { PocketBaseLoaderOptions } from "../../src/types/pocketbase-loader-options.type";

export async function insertEntries(
  data: Array<Record<string, unknown>>,
  options: PocketBaseLoaderOptions,
  superuserToken: string
): Promise<Array<PocketBaseEntry>> {
  const dbEntries: Array<PocketBaseEntry> = [];
  for (const entry of data) {
    const dbEntry = await insertEntry(entry, options, superuserToken);
    dbEntries.push(dbEntry);
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
