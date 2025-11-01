import { assert } from "console";
import type { PocketBaseLoaderBaseOptions } from "../../src/types/pocketbase-loader-options.type";
import type { PocketBaseSchemaEntry } from "../../src/types/pocketbase-schema.type";

export async function insertCollection(
  fields: Array<PocketBaseSchemaEntry>,
  options: PocketBaseLoaderBaseOptions,
  superuserToken: string
): Promise<string> {
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

  const insertResponse = await insertRequest.json();
  assert(insertResponse.id, "Collection ID is not available.");

  return insertResponse.id;
}
