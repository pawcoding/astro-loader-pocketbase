import { z } from "astro/zod";
import { describe, expect, test } from "vitest";
import { generateType } from "../../src/schema/generate-type";

describe("generateType with transform", () => {
  test("should handle schema with transform (reproduces file field issue)", () => {
    // This schema simulates what happens when file fields are present
    // The generateSchema function applies a .transform() to convert file names to URLs
    const schema = z
      .object({
        id: z.string(),
        name: z.string(),
        avatar: z.string() // This is a file field
      })
      .transform((entry) => ({
        ...entry,
        avatar: `https://example.com/files/${entry.avatar}` // Simulating transformFiles()
      }));

    // This should throw an error or produce incorrect types with zod-to-ts
    expect(() => generateType(schema)).not.toThrow();
    const type = generateType(schema);

    // The type should still be generated, but we want to verify it works
    expect(type).toBeTruthy();
    expect(type).toContain("export type Entry");
  });
});
