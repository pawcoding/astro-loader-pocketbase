import type { LoaderContext } from "astro/loaders";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";
import { parseEntry } from "./utils/parse-entry";
import { EventSource } from 'eventsource';
import { realtimeLoadEntries } from "./realtime-load-entries";
import { cleanupEntries } from "./cleanup-entries";

/**
 * Load (modified) entries from a PocketBase collection.
 *
 * @param options Options for the loader.
 * @param context Context of the loader.
 * @param adminToken Admin token to access all resources.
 * @param lastModified Date of the last fetch to only update changed entries.
 *
 * @returns `true` if the collection has an updated column, `false` otherwise.
 */
export async function loadEntries(
  options: PocketBaseLoaderOptions,
  context: LoaderContext,
  adminToken: string | undefined,
  lastModified: string | undefined
): Promise<boolean> {
  // Build the URL for the collections endpoint
  const collectionUrl = new URL(
    `api/collections/${options.collectionName}/records`,
    options.url
  ).href;

  // Create the headers for the request to append the admin token (if available)
  const collectionHeaders = new Headers();
  if (adminToken) {
    collectionHeaders.set("Authorization", adminToken);
  }

  // Log the fetching of the entries
  context.logger.info(
    `Fetching${lastModified ? " modified" : ""} data for ${context.collection
    } from ${collectionUrl}${lastModified ? ` starting at ${lastModified}` : ""
    }${adminToken ? " with admin token" : ""}`
  );

  // Prepare pagination variables
  let page = 0;
  let totalPages = 0;
  let entries = 0;
  let hasUpdatedColumn = !!lastModified;

  // @ts-expect-error import.meta not being recognized
  const isDev = import.meta.env.DEV;

  // Fetch all (modified) entries
  do {
    // Fetch entries from the collection
    // If `lastModified` is set, only fetch entries that have been modified since the last fetch
    const collectionRequest = await fetch(
      `${collectionUrl}?page=${++page}&perPage=100${lastModified
        ? `&sort=-updated,id&filter=(updated>"${lastModified}")`
        : ""
      }`,
      {
        headers: collectionHeaders
      }
    );

    // If the request was not successful, print the error message and return
    if (!collectionRequest.ok) {
      // If the collection is locked, an admin token is required
      if (collectionRequest.status === 403) {
        throw new Error(
          `The collection ${options.collectionName} is not accessible without an admin rights. Please provide an admin email and password in the config.`
        );
      }

      // Get the reason for the error
      const reason = await collectionRequest
        .json()
        .then((data) => data.message);
      const errorMessage = `Fetching data from ${options.collectionName} failed with status code ${collectionRequest.status}.\nReason: ${reason}`;
      throw new Error(errorMessage);
    }

    // Get the data from the response
    const response = await collectionRequest.json();

    // Parse and store the entries
    for (const entry of response.items) {
      await parseEntry(entry, context, options.id, options.content);

      // Check if the entry has an `updated` column
      // This is used to enable the incremental fetching of entries
      if (!hasUpdatedColumn && "updated" in entry) {
        hasUpdatedColumn = true;
      }
    }

    // Update the page and total pages
    page = response.page;
    totalPages = response.totalPages;
    entries += response.items.length;
  } while (page < totalPages);

  if (isDev) {

    const evtSource = new EventSource(`${options.url}/api/realtime/`);
    const watchCollections = options.watchCollections ? options.watchCollections : [options.collectionName];

    evtSource.addEventListener("PB_CONNECT", (e) => {
      const data = JSON.parse(e.data);
      const client_id = data.clientId;
      console.log('Connected to server with client_id: ' + client_id + 'and collection: ' + options.collectionName);
      fetch(`${options.url}/api/realtime/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': adminToken || ""
        },
        body: JSON.stringify({
          "clientId": client_id,
          "subscriptions": watchCollections
        })
      })
        .then(response => {
          if (response.status === 204) {
            return null;
          }
          return response.json();
        })
        .catch(error => console.error('Error:', error.message));
    });

    watchCollections.forEach((collection: string) => {
      evtSource.addEventListener(collection, (e) => {
        try {
          const eventData = JSON.parse(e.data);

          if (eventData.action === 'delete') {
            if (context.store.keys().length > 0) {
              cleanupEntries(options, context, adminToken).catch((error) => {
                context.logger.error(`Cleanup failed: ${error.message}`);
              });
            }
          } else {
            realtimeLoadEntries(options, context, eventData.action, hasUpdatedColumn, adminToken).catch((error) => {
              context.logger.error(`Realtime loading failed: ${error.message}`);
            });
          }
        } catch (error) {
          console.error('Error handling event:', (error as Error).message);
        }
      });
    });

  }

  // Log the number of fetched entries
  context.logger.info(
    `Fetched ${entries}${lastModified ? " changed" : ""} entries for ${context.collection
    }`
  );

  // Return if the collection has an updated column
  return hasUpdatedColumn;
}
