import { describe, expect, it } from "vitest";
import { extractFieldNames } from "../../src/utils/extract-field-names";

describe("extractFieldNames", () => {
  it("should return undefined for undefined input", () => {
    const result = extractFieldNames(undefined);
    expect(result).toBeUndefined();
  });

  it("should return the same field names without modifiers", () => {
    const fields = ["title", "content", "author"];
    const result = extractFieldNames(fields);

    expect(result).toEqual(["title", "content", "author"]);
  });

  it("should extract field names with excerpt modifiers", () => {
    const fields = [
      "description:excerpt(100)",
      "body:excerpt(500,false)",
      "summary"
    ];
    const result = extractFieldNames(fields);

    expect(result).toEqual(["description", "body", "summary"]);
  });
});
