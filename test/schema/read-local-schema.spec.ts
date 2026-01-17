import fs from "fs/promises";
import path from "path";
import { describe, expect, test, vi } from "vitest";
import { readLocalSchema } from "../../src/schema/read-local-schema";
import type { PocketBaseCollection } from "../../src/types/pocketbase-schema.type";

vi.mock("fs/promises");

describe("readLocalSchema", () => {
  const localSchemaPath = "test/pb_schema.json";
  const collectionName = "users";
  const mockSchema: Array<PocketBaseCollection> = [
    {
      name: "users",
      type: "base",
      fields: []
    },
    {
      name: "messages",
      type: "base",
      fields: []
    }
  ];

  test("should return the schema for the specified collection", async () => {
    vi.spyOn(path, "join").mockReturnValue(localSchemaPath);
    vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify(mockSchema));

    const result = await readLocalSchema(localSchemaPath, collectionName);
    expect(result).toEqual(mockSchema[0]);
  });

  test("should return undefined if the collection is not found", async () => {
    vi.spyOn(path, "join").mockReturnValue(localSchemaPath);
    vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify(mockSchema));

    const result = await readLocalSchema(localSchemaPath, "nonexistent");
    expect(result).toBeUndefined();
  });

  test("should return undefined if the schema file is invalid", async () => {
    vi.spyOn(path, "join").mockReturnValue(localSchemaPath);
    vi.spyOn(fs, "readFile").mockResolvedValue("invalid json");

    const result = await readLocalSchema(localSchemaPath, collectionName);
    expect(result).toBeUndefined();
  });

  test("should return undefined if the database is not an array", async () => {
    vi.spyOn(path, "join").mockReturnValue(localSchemaPath);
    vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify({}));

    const result = await readLocalSchema(localSchemaPath, collectionName);
    expect(result).toBeUndefined();
  });

  test("should handle file read errors gracefully", async () => {
    vi.spyOn(path, "join").mockReturnValue(localSchemaPath);
    vi.spyOn(fs, "readFile").mockRejectedValue(new Error("File read error"));

    const result = await readLocalSchema(localSchemaPath, collectionName);
    expect(result).toBeUndefined();
  });
});
