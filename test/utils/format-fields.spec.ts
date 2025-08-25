import { describe, expect, it, vi } from "vitest";
import { formatFields } from "../../src/utils/format-fields";

describe("formatFields", () => {
  describe("when no fields are provided", () => {
    it("should return undefined for undefined input", () => {
      const result = formatFields(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("when fields are provided as a string", () => {
    it("should return the string as-is for simple fields", () => {
      const result = formatFields("title,content,author");
      expect(result).toBe("title,content,author");
    });

    it("should return the string as-is for a single field", () => {
      const result = formatFields("title");
      expect(result).toBe("title");
    });
  });

  describe("when fields are provided as an array", () => {
    it("should join array fields with commas", () => {
      const result = formatFields(["title", "content", "author"]);
      expect(result).toBe("title,content,author");
    });

    it("should handle single field array", () => {
      const result = formatFields(["title"]);
      expect(result).toBe("title");
    });

    it("should handle empty array", () => {
      const result = formatFields([]);
      expect(result).toBe("");
    });
  });

  describe("when expand is used", () => {
    it("should warn when expand is in string fields", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const result = formatFields("title,expand,content");

      expect(result).toBe("title,expand,content");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'The "expand" field is not currently supported by the PocketBase loader. ' +
          "Expand functionality may be added in a future version."
      );
    });

    it("should warn when expand is in array fields", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const result = formatFields(["title", "expand", "content"]);

      expect(result).toBe("title,expand,content");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'The "expand" field is not currently supported by the PocketBase loader. ' +
          "Expand functionality may be added in a future version."
      );
    });

    it("should warn when expand with dot notation is used", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const result = formatFields("title,expand.user,content");

      expect(result).toBe("title,expand.user,content");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'The "expand" field is not currently supported by the PocketBase loader. ' +
          "Expand functionality may be added in a future version."
      );
    });

    it("should not warn when expand is part of another field name", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const result = formatFields("title,expanded_content,content");

      expect(result).toBe("title,expanded_content,content");
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
