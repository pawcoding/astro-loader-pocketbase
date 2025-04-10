import { assert } from "console";
import type { PocketBaseLoaderOptions } from "../../src/types/pocketbase-loader-options.type";

export async function insertCollection(
  fields: Array<Record<string, unknown>>,
  options: PocketBaseLoaderOptions,
  superuserToken: string
): Promise<void> {
  const insertRequest = await fetch(new URL(`api/collections`, options.url), {
    method: "POST",
    headers: {
      Authorization: superuserToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: options.collectionName,
      fields: [...fields]
    })
  });

  assert(insertRequest.status === 200, "Collection is not available.");
}
