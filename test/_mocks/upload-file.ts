import { assert } from "console";
import type { PocketBaseEntry } from "../../src/types/pocketbase-entry.type";
import type { PocketBaseLoaderOptions } from "../../src/types/pocketbase-loader-options.type";

export async function uploadFile(
  entryId: string,
  options: PocketBaseLoaderOptions,
  superuserToken: string
): Promise<PocketBaseEntry> {
  const file = new Blob(["Hello World"], { type: "text/plain" });
  const formData = new FormData();
  formData.append("file_field", file, "hello.txt");

  const updateRequest = await fetch(
    new URL(
      `api/collections/${options.collectionName}/records/${entryId}`,
      options.url
    ),
    {
      method: "PATCH",
      headers: {
        Authorization: superuserToken
      },
      body: formData
    }
  );

  assert(updateRequest.status === 200, "Failed to upload file to entry.");

  const updatedEntry = await updateRequest.json();
  return updatedEntry;
}
