import { assert } from "vitest";
import type { PocketBaseLoaderOptions } from "../../src/types/pocketbase-loader-options.type";

export async function deleteCollection(
  options: PocketBaseLoaderOptions,
  superuserToken: string
): Promise<void> {
  const deleteRequest = await fetch(
    new URL(`api/collections/${options.collectionName}`, options.url),
    {
      method: "DELETE",
      headers: {
        Authorization: superuserToken,
        "Content-Type": "application/json"
      }
    }
  );

  assert(deleteRequest.status === 204, "Deleting collection failed.");
}
