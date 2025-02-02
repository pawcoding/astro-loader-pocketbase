import { describe, expect, test } from "vitest";
import { transformFiles } from "../../src/schema/transform-files";
import type { PocketBaseSchemaEntry } from "../../src/types/pocketbase-schema.type";
import { createPocketbaseEntry } from "../_mocks/create-pocketbase-entry";

describe("transformFiles", () => {
  const baseUrl = "http://localhost:8090";
  const fileFields = [
    { name: "avatar", maxSelect: 1 },
    { name: "documents", maxSelect: 5 }
  ] as Array<PocketBaseSchemaEntry>;

  test("should transform single file name to URL", () => {
    const entry = createPocketbaseEntry({
      avatar: "avatar.png"
    });

    const result = transformFiles(baseUrl, fileFields, entry);
    expect(result.avatar).toBe(
      `${baseUrl}/api/files/${entry.collectionName}/${entry.id}/avatar.png`
    );
  });

  test("should transform multiple file names to URLs", () => {
    const documents = ["doc1.pdf", "doc2.pdf"];
    const entry = createPocketbaseEntry({
      documents
    });

    const result = transformFiles(baseUrl, fileFields, entry);
    expect(result.documents).toEqual([
      `${baseUrl}/api/files/${entry.collectionName}/${entry.id}/${documents[0]}`,
      `${baseUrl}/api/files/${entry.collectionName}/${entry.id}/${documents[1]}`
    ]);
  });

  test("should skip transformation if single file name is not present", () => {
    const entry = createPocketbaseEntry();

    const result = transformFiles(baseUrl, fileFields, entry);
    expect(result.avatar).toBeUndefined();
  });

  test("should skip transformation if multiple file names are not present", () => {
    const entry = createPocketbaseEntry({
      documents: []
    });

    const result = transformFiles(baseUrl, fileFields, entry);
    expect(result.documents).toEqual([]);
  });

  test("should handle entries with no file fields", () => {
    const entry = createPocketbaseEntry();

    const result = transformFiles(baseUrl, [], entry);
    expect(result).toEqual(entry);
  });
});
