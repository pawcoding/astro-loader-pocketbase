import { describe, expect, it } from "vitest";
import { extractFieldNames } from "../../src/utils/extract-field-names";

describe("extractFieldNames", () => {
  describe("when no fields are provided", () => {
    it("should return undefined for undefined input", () => {
      const result = extractFieldNames(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("when fields without modifiers are provided", () => {
    it("should return the same field names", () => {
      const fields = ["title", "content", "author"];
      const result = extractFieldNames(fields);

      expect(result).toEqual(["title", "content", "author"]);
    });
  });

  describe("when fields with excerpt modifiers are provided", () => {
    it("should extract field names from excerpt syntax", () => {
      const fields = ["title", "content:excerpt(200,true)", "author"];
      const result = extractFieldNames(fields);

      expect(result).toEqual(["title", "content", "author"]);
    });

    it("should handle complex excerpt modifiers", () => {
      const fields = [
        "description:excerpt(100)",
        "body:excerpt(500,false)",
        "summary:excerpt(50,true)"
      ];
      const result = extractFieldNames(fields);

      expect(result).toEqual(["description", "body", "summary"]);
    });
  });

  describe("when fields with other modifiers are provided", () => {
    it("should extract field names from any colon-based modifier", () => {
      const fields = [
        "title",
        "content:excerpt(200)",
        "date:format(YYYY-MM-DD)",
        "nested.field:modifier"
      ];
      const result = extractFieldNames(fields);

      expect(result).toEqual(["title", "content", "date", "nested.field"]);
    });
  });

  describe("when mixed fields are provided", () => {
    it("should handle a mix of fields with and without modifiers", () => {
      const fields = [
        "id",
        "title",
        "content:excerpt(200,true)",
        "author",
        "publishedDate:format(YYYY-MM-DD)",
        "tags"
      ];
      const result = extractFieldNames(fields);

      expect(result).toEqual([
        "id",
        "title",
        "content",
        "author",
        "publishedDate",
        "tags"
      ]);
    });
  });
});
