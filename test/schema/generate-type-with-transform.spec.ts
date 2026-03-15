import { z } from "astro/zod";
import { describe, expect, test } from "vitest";
import { generateType } from "../../src/schema/generate-type";

describe("generateType", () => {
  test("should handle schema without transform (file field scenario)", () => {
    // After the fix, generateSchema no longer applies .transform()
    // Instead, file transformation happens at the loader level
    // This test verifies that schemas without transform work correctly
    const schema = z.object({
      id: z.string(),
      name: z.string(),
      avatar: z.string() // File field - will be transformed in loader, not in schema
    });

    // Should not throw an error anymore
    const type = generateType(schema);

    // Verify type generation works
    expect(type).toBeTruthy();
    expect(type).toContain("export type Entry");
    expect(type).toContain("avatar");
  });

  test("should fail with schema that has transform (documenting the problem)", () => {
    // This test documents the original problem - schemas with .transform()
    // cannot be processed by zod-to-ts
    const schemaWithTransform = z
      .object({
        id: z.string(),
        name: z.string(),
        avatar: z.string()
      })
      .transform((entry) => ({
        ...entry,
        avatar: `https://example.com/files/${entry.avatar}`
      }));

    // This will throw because zod-to-ts cannot handle transforms
    expect(() => generateType(schemaWithTransform)).toThrow(
      'Schemas of type "transform" cannot be represented in TypeScript'
    );
  });
});
