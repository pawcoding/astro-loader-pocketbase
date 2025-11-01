import { describe, expect, test } from "vitest";
import { PocketBaseConfigurationError } from "../../src/types/errors";
import { formatExpand } from "../../src/utils/format-expand";

describe("formatExpand", () => {
  test("should return undefined when expand is undefined", () => {
    const result = formatExpand(undefined, "");
    expect(result).toBeUndefined();
  });

  test("should return undefined when expand is empty array", () => {
    const result = formatExpand([], "");
    expect(result).toBeUndefined();
  });

  test("should format single expand field", () => {
    const result = formatExpand(["author"], "");
    expect(result).toBe("author");
  });

  test("should format multiple expand fields with comma", () => {
    const result = formatExpand(["author", "category"], "");
    expect(result).toBe("author,category");
  });

  test("should handle nested expand fields", () => {
    const result = formatExpand(["author.profile", "category.parent"], "");
    expect(result).toBe("author.profile,category.parent");
  });

  test("should handle deeply nested expand fields up to 6 levels", () => {
    const result = formatExpand(
      ["level1.level2.level3.level4.level5.level6"],
      ""
    );
    expect(result).toBe("level1.level2.level3.level4.level5.level6");
  });

  test("should throw error when expand exceeds 6 levels", () => {
    expect(() =>
      formatExpand(["level1.level2.level3.level4.level5.level6.level7"], "")
    ).toThrow(PocketBaseConfigurationError);
  });

  test("should throw error when field contains comma", () => {
    expect(() => formatExpand(["author,category"], "")).toThrow(
      PocketBaseConfigurationError
    );
  });
});
