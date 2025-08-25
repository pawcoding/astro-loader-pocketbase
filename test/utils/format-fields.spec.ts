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
    it("should return an array for simple fields", () => {
      const result = formatFields("title,content,author");
      expect(result).toEqual(["title", "content", "author"]);
    });

    it("should return an array for a single field", () => {
      const result = formatFields("title");
      expect(result).toEqual(["title"]);
    });

    it("should return undefined for the * wildcard", () => {
      const result = formatFields("*");
      expect(result).toBeUndefined();
    });

    it("should trim whitespace from fields", () => {
      const result = formatFields(" title , content , author ");
      expect(result).toEqual(["title", "content", "author"]);
    });
  });

  describe("when fields are provided as an array", () => {
    it("should return the trimmed array", () => {
      const result = formatFields(["title", "content", "author"]);
      expect(result).toEqual(["title", "content", "author"]);
    });

    it("should handle single field array", () => {
      const result = formatFields(["title"]);
      expect(result).toEqual(["title"]);
    });

    it("should handle empty array", () => {
      const result = formatFields([]);
      expect(result).toEqual([]);
    });

    it("should trim whitespace from array fields", () => {
      const result = formatFields([" title ", " content ", " author "]);
      expect(result).toEqual(["title", "content", "author"]);
    });
  });

  describe("when expand is used", () => {
    it("should warn when expand is in string fields", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const result = formatFields("title,expand,content");

      expect(result).toEqual(["title", "expand", "content"]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'The "expand" field is not currently supported by the PocketBase loader. ' +
          "Expand functionality may be added in a future version."
      );
    });

    it("should warn when expand is in array fields", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const result = formatFields(["title", "expand", "content"]);

      expect(result).toEqual(["title", "expand", "content"]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'The "expand" field is not currently supported by the PocketBase loader. ' +
          "Expand functionality may be added in a future version."
      );
    });

    it("should warn when expand with dot notation is used", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const result = formatFields("title,expand.user,content");

      expect(result).toEqual(["title", "expand.user", "content"]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'The "expand" field is not currently supported by the PocketBase loader. ' +
          "Expand functionality may be added in a future version."
      );
    });

    it("should not warn when expand is part of another field name", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const result = formatFields("title,expanded_content,content");

      expect(result).toEqual(["title", "expanded_content", "content"]);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
