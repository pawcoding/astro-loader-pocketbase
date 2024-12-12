import type { LoaderContext } from "astro/loaders";
import type { PocketBaseLoaderOptions } from "./types/pocketbase-loader-options.type";
import { parseEntry } from "./utils/parse-entry";
import type { PocketBaseRealtimeActions } from "./types/pocketbase-realtime-action.type";

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
export async function realtimeLoadEntries(options: PocketBaseLoaderOptions,
    context: LoaderContext,
    action: PocketBaseRealtimeActions,
    hasUpdatedColumn: boolean,
    adminToken: string | undefined) {


    //TODO: Consider possibility of using trigger record updatedAt - should be simpler but with one caveat I can think of
    const realTimeLastModified = hasUpdatedColumn ? context.meta.get("realtime-last-modified") : undefined;

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
        `[TRIGGER=${action}]:Realtime Fetching${realTimeLastModified ? " modified" : ""} data for ${context.collection
        } from ${collectionUrl}${realTimeLastModified ? ` starting at ${realTimeLastModified}` : ""
        }${adminToken ? " with admin token" : ""}`
    );

    // Prepare pagination variables
    let page = 0;
    let totalPages = 0;
    let entries = 0;
    //let hasUpdatedColumn = !!lastModified;

    // Fetch all (modified) entries
    do {
        // Fetch entries from the collection
        // If `realTimeLastModified` is set, only fetch entries that have been modified since the last fetch
        const collectionRequest = await fetch(
            `${collectionUrl}?page=${++page}&perPage=100${realTimeLastModified
                ? `&sort=-updated,id&filter=(updated>"${realTimeLastModified}")`
                : ""
            }`,
            {
                headers: collectionHeaders
            }
        );

        console.log(`${collectionUrl}?page=${page}&perPage=100${realTimeLastModified
                ? `&sort=-updated,id&filter=(updated>"${realTimeLastModified}")`
                : ""
            }`);

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
            //if (!hasUpdatedColumn && "updated" in entry) {
            //    hasUpdatedColumn = true;
            //}
        }

        // Update the page and total pages
        page = response.page;
        totalPages = response.totalPages;
        entries += response.items.length;
    } while (page < totalPages);

    context.meta.set("realtime-last-modified", new Date().toISOString().replace('T', ' '));

    context.logger.info(
        `Fetched ${entries}${realTimeLastModified ? " changed" : ""} entries for ${context.collection
        }`
    );
}