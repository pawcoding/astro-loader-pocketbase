import fs from "fs/promises";
import path from "path";
import type { PocketBaseCollection } from "../types/pocketbase-schema.type";
import { pocketBaseDatabase } from "../types/pocketbase-schema.type";

/**
 * Reads the local PocketBase schema file and returns the schema for the specified collection.
 *
 * @param localSchemaPath Path to the local schema file.
 * @param collectionName Name of the collection to get the schema for.
 */
export async function readLocalSchema(
  localSchemaPath: string,
  collectionName: string
): Promise<PocketBaseCollection | undefined> {
  const realPath = path.join(process.cwd(), localSchemaPath);

  try {
    // Read the schema file
    const schemaFile = await fs.readFile(realPath, "utf-8");

    const fileContent = pocketBaseDatabase.safeParse(JSON.parse(schemaFile));

    // Check if the database file is valid
    if (!fileContent.success) {
      throw new Error("Invalid schema file");
    }

    // Find and return the schema for the collection
    const schema = fileContent.data.find(
      (collection) => collection.name === collectionName
    );

    if (!schema) {
      throw new Error(
        `Collection "${collectionName}" not found in schema file`
      );
    }

    return schema;
  } catch (error) {
    console.error(
      `Failed to read local schema from ${localSchemaPath}. No types will be generated.\nReason: ${error}`
    );
    return undefined;
  }
}
