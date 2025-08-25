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

    it("should return undefined when * wildcard is mixed with other fields", () => {
      const result = formatFields("title,*,content");
      expect(result).toBeUndefined();
    });

    it("should return undefined when * wildcard is at the end", () => {
      const result = formatFields("title,content,*");
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

    it("should return undefined when * wildcard is in array", () => {
      const result = formatFields(["title", "*", "content"]);
      expect(result).toBeUndefined();
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

    it("should warn when expand is part of field name with includes check", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const result = formatFields("title,some_expand_field,content");

      expect(result).toEqual(["title", "some_expand_field", "content"]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'The "expand" field is not currently supported by the PocketBase loader. ' +
          "Expand functionality may be added in a future version."
      );
    });

    it("should warn with mixed wildcard and expand but return undefined for wildcard", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const result = formatFields("*,expand.field");

      expect(result).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'The "expand" field is not currently supported by the PocketBase loader. ' +
          "Expand functionality may be added in a future version."
      );
    });
  });

  describe("when excerpt fields are used", () => {
    it("should preserve valid excerpt field syntax", () => {
      const result = formatFields(
        "title,description:excerpt(200,true),content"
      );

      expect(result).toEqual([
        "title",
        "description:excerpt(200,true)",
        "content"
      ]);
    });

    it("should preserve excerpt field with just maxLength", () => {
      const result = formatFields("title,content:excerpt(150)");

      expect(result).toEqual(["title", "content:excerpt(150)"]);
    });

    it("should preserve excerpt field even with invalid syntax", () => {
      const result = formatFields("title,content:excerpt(invalid),author");

      expect(result).toEqual(["title", "content:excerpt(invalid)", "author"]);
    });

    it("should preserve excerpt field even with missing parentheses", () => {
      const result = formatFields("title,content:excerpt");

      expect(result).toEqual(["title", "content:excerpt"]);
    });
  });
});
