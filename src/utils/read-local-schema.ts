import fs from "fs/promises";
import path from "path";
import type {
  PocketBaseCollection,
  PocketBaseSchemaEntry
} from "../types/pocketbase-schema.type";

/**
 * Reads the local PocketBase schema file and returns the schema for the specified collection.
 *
 * @param localSchemaPath Path to the local schema file.
 * @param collectionName Name of the collection to get the schema for.
 */
export async function readLocalSchema(
  localSchemaPath: string,
  collectionName: string
): Promise<Array<PocketBaseSchemaEntry> | undefined> {
  const realPath = path.join(process.cwd(), localSchemaPath);

  try {
    // Read the schema file
    const schemaFile = await fs.readFile(realPath, "utf-8");
    const database: Array<PocketBaseCollection> = JSON.parse(schemaFile);

    // Check if the database file is valid
    if (!database || !Array.isArray(database)) {
      throw new Error("Invalid schema file");
    }

    // Find and return the schema for the collection
    const schema = database.find(
      (collection) => collection.name === collectionName
    );

    if (!schema) {
      throw new Error(
        `Collection "${collectionName}" not found in schema file`
      );
    }

    return schema.schema;
  } catch (error) {
    console.error(
      `Failed to read local schema from ${localSchemaPath}. No types will be generated.\nReason: ${error}`
    );
    return undefined;
  }
}
