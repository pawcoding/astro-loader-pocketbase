import { assert } from "vitest";
import type { PocketBaseLoaderOptions } from "../../src/types/pocketbase-loader-options.type";

export async function deleteEntries(
  entryIds: Array<string>,
  options: PocketBaseLoaderOptions,
  superuserToken: string
): Promise<void> {
  for (const entryId of entryIds) {
    await deleteEntry(entryId, options, superuserToken);
  }
}

export async function deleteEntry(
  entryId: string,
  options: PocketBaseLoaderOptions,
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
